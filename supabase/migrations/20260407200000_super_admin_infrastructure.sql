-- ============================================================
-- BizRent Super Admin Infrastructure Migration
-- Adds tables and RPC functions for the Sovereignty Dashboard
-- ============================================================

-- 1. system_announcements — global banners shown across portals
CREATE TABLE IF NOT EXISTS public.system_announcements (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  message     text        NOT NULL,
  type        varchar(20) NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO','WARNING','CRITICAL')),
  audience    varchar(20) NOT NULL DEFAULT 'ALL' CHECK (audience IN ('ALL','LANDLORDS_ONLY','TENANTS_ONLY')),
  active_from timestamptz NOT NULL DEFAULT now(),
  active_until timestamptz,
  created_by  uuid        REFERENCES public.users(id),
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 2. feature_flags — per-feature or per-org toggles
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key        varchar(100) UNIQUE NOT NULL,
  is_enabled      boolean     NOT NULL DEFAULT false,
  target_org_ids  uuid[],
  description     text,
  updated_by      uuid        REFERENCES public.users(id),
  updated_at      timestamptz DEFAULT now()
);

INSERT INTO public.feature_flags (flag_key, is_enabled, description)
VALUES
  ('WHATSAPP_NOTIFICATIONS', false, 'Enable WhatsApp SMS notifications globally'),
  ('PDF_RECEIPT_AUTO_GENERATION', true, 'Auto-generate PDF receipts on payment approval'),
  ('PARTIAL_PAYMENTS', false, 'Allow tenants to submit partial payment amounts'),
  ('API_WEBHOOK_ACCESS', false, 'Enable external webhook API for integrators'),
  ('KINYARWANDA_UI', false, 'Enable Kinyarwanda language option in tenant portal'),
  ('BULK_INVOICE_GENERATOR', true, 'Allow manual bulk invoice generation from super admin')
ON CONFLICT (flag_key) DO NOTHING;

-- 3. org_limit_overrides — per-org limit bypass
CREATE TABLE IF NOT EXISTS public.org_limit_overrides (
  org_id         uuid    PRIMARY KEY REFERENCES public.organisations(id) ON DELETE CASCADE,
  max_units      integer,
  max_properties integer,
  max_managers   integer,
  overridden_by  uuid    REFERENCES public.users(id),
  overridden_at  timestamptz DEFAULT now()
);

-- ============================================================
-- RPC Functions
-- ============================================================

-- 4. Force-approve a payment (bypasses org RLS)
CREATE OR REPLACE FUNCTION public.superadmin_force_approve_payment(p_payment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_pay      RECORD;
BEGIN
  SELECT * INTO v_pay FROM payments WHERE id = p_payment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;

  UPDATE payments
  SET status = 'APPROVED', reviewed_by = v_admin_id, reviewed_at = now()
  WHERE id = p_payment_id;

  UPDATE invoices
  SET amount_paid = amount_paid + v_pay.amount,
      status = CASE
        WHEN amount_paid + v_pay.amount >= amount_due THEN 'PAID'
        ELSE 'PARTIAL'
      END
  WHERE id = v_pay.invoice_id;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (v_pay.org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_PAYMENT_FORCE_APPROVED',
          'PAYMENT', p_payment_id,
          jsonb_build_object('before', jsonb_build_object('status', v_pay.status),
                             'after',  jsonb_build_object('status', 'APPROVED')));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_force_approve_payment(uuid) TO authenticated;

-- 5. Force-reject a payment
CREATE OR REPLACE FUNCTION public.superadmin_force_reject_payment(p_payment_id uuid, p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_pay      RECORD;
BEGIN
  SELECT * INTO v_pay FROM payments WHERE id = p_payment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;

  UPDATE payments
  SET status = 'REJECTED', rejection_reason = p_reason,
      reviewed_by = v_admin_id, reviewed_at = now()
  WHERE id = p_payment_id;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (v_pay.org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_PAYMENT_FORCE_REJECTED',
          'PAYMENT', p_payment_id,
          jsonb_build_object('before', jsonb_build_object('status', v_pay.status),
                             'after',  jsonb_build_object('status', 'REJECTED', 'reason', p_reason)));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_force_reject_payment(uuid, text) TO authenticated;

-- 6. Wipe invoice debt
CREATE OR REPLACE FUNCTION public.superadmin_wipe_debt(p_invoice_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_inv      RECORD;
BEGIN
  SELECT * INTO v_inv FROM invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;

  UPDATE invoices
  SET amount_paid = amount_due, status = 'PAID',
      notes = COALESCE(notes || E'\n', '') || 'Debt waived by Super Admin on ' || now()::date
  WHERE id = p_invoice_id;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (v_inv.org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_DEBT_WAIVED',
          'INVOICE', p_invoice_id,
          jsonb_build_object('before', jsonb_build_object('status', v_inv.status, 'amount_paid', v_inv.amount_paid),
                             'after',  jsonb_build_object('status', 'PAID', 'amount_paid', v_inv.amount_due)));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_wipe_debt(uuid) TO authenticated;

-- 7. Adjust invoice balance
CREATE OR REPLACE FUNCTION public.superadmin_adjust_balance(
  p_invoice_id uuid, p_amount_due numeric, p_amount_paid numeric
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_inv      RECORD;
  v_new_status text;
BEGIN
  SELECT * INTO v_inv FROM invoices WHERE id = p_invoice_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invoice not found'; END IF;

  v_new_status := CASE
    WHEN p_amount_paid >= p_amount_due THEN 'PAID'
    WHEN p_amount_paid > 0 THEN 'PARTIAL'
    WHEN v_inv.due_date < CURRENT_DATE THEN 'OVERDUE'
    ELSE 'DUE'
  END;

  UPDATE invoices
  SET amount_due = p_amount_due, amount_paid = p_amount_paid, status = v_new_status
  WHERE id = p_invoice_id;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (v_inv.org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_BALANCE_ADJUSTED',
          'INVOICE', p_invoice_id,
          jsonb_build_object(
            'before', jsonb_build_object('amount_due', v_inv.amount_due, 'amount_paid', v_inv.amount_paid, 'status', v_inv.status),
            'after',  jsonb_build_object('amount_due', p_amount_due,     'amount_paid', p_amount_paid,     'status', v_new_status)));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_adjust_balance(uuid, numeric, numeric) TO authenticated;

-- 8. Extend trial
CREATE OR REPLACE FUNCTION public.superadmin_extend_trial(p_org_id uuid, p_days integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin_id uuid := auth.uid(); BEGIN
  UPDATE organisations
  SET trial_ends_at = GREATEST(COALESCE(trial_ends_at, now()), now()) + (p_days || ' days')::interval
  WHERE id = p_org_id;

  UPDATE subscriptions
  SET trial_ends_at = GREATEST(COALESCE(trial_ends_at, now()), now()) + (p_days || ' days')::interval
  WHERE org_id = p_org_id;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (p_org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_TRIAL_EXTENDED', 'ORGANISATION', p_org_id,
          jsonb_build_object('extended_by_days', p_days));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_extend_trial(uuid, integer) TO authenticated;

-- 9. Suspend / reinstate org
CREATE OR REPLACE FUNCTION public.superadmin_suspend_org(p_org_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin_id uuid := auth.uid(); BEGIN
  UPDATE organisations SET is_active = false, subscription_status = 'LAPSED' WHERE id = p_org_id;
  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id)
  VALUES (p_org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_ORG_SUSPENDED', 'ORGANISATION', p_org_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_suspend_org(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.superadmin_reinstate_org(p_org_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin_id uuid := auth.uid(); BEGIN
  UPDATE organisations SET is_active = true, subscription_status = 'TRIAL' WHERE id = p_org_id;
  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id)
  VALUES (p_org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_ORG_REINSTATED', 'ORGANISATION', p_org_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_reinstate_org(uuid) TO authenticated;

-- 10. Role injection — change a user's role in an org
CREATE OR REPLACE FUNCTION public.superadmin_change_role(
  p_user_id uuid, p_org_id uuid, p_new_role text
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_old_role text;
BEGIN
  SELECT role::text INTO v_old_role
  FROM user_organisation_roles
  WHERE user_id = p_user_id AND org_id = p_org_id;

  UPDATE user_organisation_roles
  SET role = p_new_role::user_role_enum
  WHERE user_id = p_user_id AND org_id = p_org_id;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (p_org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_ROLE_CHANGED', 'USER', p_user_id,
          jsonb_build_object('before', jsonb_build_object('role', v_old_role),
                             'after',  jsonb_build_object('role', p_new_role)));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_change_role(uuid, uuid, text) TO authenticated;

-- 11. Override unit status
CREATE OR REPLACE FUNCTION public.superadmin_override_unit_status(p_unit_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_unit     RECORD;
BEGIN
  SELECT * INTO v_unit FROM units WHERE id = p_unit_id;
  UPDATE units SET status = p_status::unit_status_enum WHERE id = p_unit_id;
  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (v_unit.org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_UNIT_STATUS_OVERRIDDEN', 'UNIT', p_unit_id,
          jsonb_build_object('before', jsonb_build_object('status', v_unit.status::text),
                             'after',  jsonb_build_object('status', p_status)));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_override_unit_status(uuid, text) TO authenticated;

-- 12. Set org limit override
CREATE OR REPLACE FUNCTION public.superadmin_set_limit_override(
  p_org_id uuid, p_max_units integer, p_max_properties integer, p_max_managers integer
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_admin_id uuid := auth.uid(); BEGIN
  INSERT INTO org_limit_overrides (org_id, max_units, max_properties, max_managers, overridden_by, overridden_at)
  VALUES (p_org_id, p_max_units, p_max_properties, p_max_managers, v_admin_id, now())
  ON CONFLICT (org_id) DO UPDATE SET
    max_units = EXCLUDED.max_units,
    max_properties = EXCLUDED.max_properties,
    max_managers = EXCLUDED.max_managers,
    overridden_by = EXCLUDED.overridden_by,
    overridden_at = EXCLUDED.overridden_at;

  INSERT INTO audit_logs (org_id, actor_user_id, actor_role, action, target_type, target_id, diff)
  VALUES (p_org_id, v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_LIMIT_OVERRIDE_SET', 'ORGANISATION', p_org_id,
          jsonb_build_object('max_units', p_max_units, 'max_properties', p_max_properties, 'max_managers', p_max_managers));
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_set_limit_override(uuid, integer, integer, integer) TO authenticated;

-- 13. Fraud signals query
CREATE OR REPLACE FUNCTION public.get_fraud_signals()
RETURNS TABLE (
  signal_type text, description text, affected_count bigint, details jsonb
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Duplicate MoMo transaction IDs
  RETURN QUERY
  SELECT 'DUPLICATE_MOMO_ID'::text,
    'Multiple payments sharing the same MoMo Transaction ID'::text,
    COUNT(DISTINCT p.id),
    jsonb_agg(jsonb_build_object('transaction_id', p.transaction_id, 'count', p.cnt))
  FROM (
    SELECT transaction_id, COUNT(*) AS cnt
    FROM payments WHERE transaction_id IS NOT NULL
    GROUP BY transaction_id HAVING COUNT(*) > 1
  ) p;

  -- Rapid submission: >3 pending payments from same tenant in 1 hour
  RETURN QUERY
  SELECT 'RAPID_SUBMISSIONS'::text,
    'Tenants submitting more than 3 payments within 1 hour'::text,
    COUNT(DISTINCT tenant_user_id),
    jsonb_agg(jsonb_build_object('tenant_user_id', tenant_user_id, 'submissions', cnt))
  FROM (
    SELECT tenant_user_id, COUNT(*) AS cnt
    FROM payments
    WHERE submitted_at > now() - interval '1 hour'
    GROUP BY tenant_user_id HAVING COUNT(*) > 3
  ) r;

  -- Orphaned PENDING payments older than 7 days (stuck submissions)
  RETURN QUERY
  SELECT 'STALE_PENDING'::text,
    'PENDING payments older than 7 days — tenant may be blocked from resubmitting'::text,
    COUNT(*)::bigint,
    jsonb_build_object('oldest_submitted_at', MIN(submitted_at))
  FROM payments
  WHERE status = 'PENDING' AND submitted_at < now() - interval '7 days';
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_fraud_signals() TO authenticated;

-- 14. Mark overdue invoices platform-wide
CREATE OR REPLACE FUNCTION public.superadmin_bulk_mark_overdue()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer; v_admin_id uuid := auth.uid(); BEGIN
  UPDATE invoices SET status = 'OVERDUE'
  WHERE status = 'DUE' AND due_date < CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  INSERT INTO audit_logs (actor_user_id, actor_role, action, diff)
  VALUES (v_admin_id, 'SUPER_ADMIN', 'SUPER_ADMIN_BULK_MARK_OVERDUE',
          jsonb_build_object('invoices_updated', v_count));
  RETURN v_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_bulk_mark_overdue() TO authenticated;

-- 15. Data integrity check
CREATE OR REPLACE FUNCTION public.superadmin_data_integrity_check()
RETURNS TABLE (check_name text, status text, violation_count bigint, sample jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY SELECT 'Units OCCUPIED but no ACTIVE tenancy'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*),
    jsonb_agg(id) FILTER (WHERE id IS NOT NULL)
  FROM units u
  WHERE u.status = 'OCCUPIED'
    AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'ACTIVE');

  RETURN QUERY SELECT 'Invoices with amount_paid > amount_due'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*), jsonb_agg(id) FILTER (WHERE id IS NOT NULL)
  FROM invoices WHERE amount_paid > amount_due;

  RETURN QUERY SELECT 'APPROVED payments with no receipt'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*), jsonb_agg(p.id) FILTER (WHERE p.id IS NOT NULL)
  FROM payments p
  WHERE p.status = 'APPROVED'
    AND NOT EXISTS (SELECT 1 FROM receipts r WHERE r.payment_id = p.id);

  RETURN QUERY SELECT 'Stale ACTIVE tenancies (end_date passed)'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*), jsonb_agg(id) FILTER (WHERE id IS NOT NULL)
  FROM tenancies WHERE status = 'ACTIVE' AND end_date IS NOT NULL AND end_date < CURRENT_DATE;

  RETURN QUERY SELECT 'Units VACANT with an ACTIVE tenancy'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
    COUNT(*), jsonb_agg(u.id) FILTER (WHERE u.id IS NOT NULL)
  FROM units u
  WHERE u.status = 'VACANT'
    AND EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = u.id AND t.status = 'ACTIVE');
END;
$$;
GRANT EXECUTE ON FUNCTION public.superadmin_data_integrity_check() TO authenticated;

-- RLS on new tables (super admin only — no tenant/landlord access needed)
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_limit_overrides ENABLE ROW LEVEL SECURITY;

-- System announcements: readable by all authenticated (for the banner), writeable only by super admin
CREATE POLICY "announcements_read" ON public.system_announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements_write" ON public.system_announcements FOR ALL TO authenticated
  USING (current_setting('app.user_role', TRUE) = 'SUPER_ADMIN' OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fredricknjorogekariuki@gmail.com'));

-- Feature flags: readable by all authenticated
CREATE POLICY "flags_read" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "flags_write" ON public.feature_flags FOR ALL TO authenticated
  USING (current_setting('app.user_role', TRUE) = 'SUPER_ADMIN' OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fredricknjorogekariuki@gmail.com'));

-- Limit overrides: readable by service role + super admin only
CREATE POLICY "limits_all" ON public.org_limit_overrides FOR ALL TO authenticated
  USING (current_setting('app.user_role', TRUE) = 'SUPER_ADMIN' OR
         EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'fredricknjorogekariuki@gmail.com'));
