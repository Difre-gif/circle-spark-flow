-- Add local time-of-day control for invoice generation.

ALTER TABLE public.tenancies
  ADD COLUMN IF NOT EXISTS invoice_send_time time CHECK (invoice_send_time IS NULL OR invoice_send_time >= time '00:00');

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS invoice_send_time time CHECK (invoice_send_time IS NULL OR invoice_send_time >= time '00:00');

UPDATE public.organisations
SET settings = jsonb_set(
  settings,
  '{billing,default_invoice_send_time}',
  to_jsonb(COALESCE(settings->'billing'->>'default_invoice_send_time', '08:00')),
  true
);

CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_token uuid,
  p_full_name text DEFAULT NULL,
  p_username text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_inv RECORD;
  v_auth_email text;
  v_monthly_rent numeric;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO v_inv FROM invitations WHERE id = p_token;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid invitation'; END IF;
  IF v_inv.created_at < NOW() - INTERVAL '7 days' THEN RAISE EXCEPTION 'Invitation has expired'; END IF;
  SELECT email INTO v_auth_email FROM auth.users WHERE id = v_user_id;
  IF lower(v_auth_email) != lower(v_inv.email) THEN RAISE EXCEPTION 'This invitation was sent to a different email address.'; END IF;
  UPDATE users SET full_name = COALESCE(NULLIF(trim(p_full_name), ''), full_name), username = COALESCE(NULLIF(trim(p_username), ''), username) WHERE id = v_user_id;
  INSERT INTO user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
  VALUES (v_user_id, v_inv.org_id, v_inv.role, true, NOW())
  ON CONFLICT (user_id, org_id) DO UPDATE SET role = EXCLUDED.role, is_active = true, accepted_at = NOW();
  IF v_inv.unit_id IS NOT NULL AND v_inv.role = 'TENANT' THEN
    SELECT monthly_rent INTO v_monthly_rent FROM units WHERE id = v_inv.unit_id AND org_id = v_inv.org_id AND is_active = true;
    IF v_monthly_rent IS NULL THEN RAISE EXCEPTION 'Assigned unit is no longer available.'; END IF;
    INSERT INTO tenancies (org_id, unit_id, tenant_user_id, start_date, agreed_rent, deposit_amount, status, created_by, billing_frequency, period_anchor_day, invoice_lead_days, invoice_send_time)
    SELECT v_inv.org_id, v_inv.unit_id, v_user_id, COALESCE(v_inv.tenancy_start_date, CURRENT_DATE), COALESCE(v_inv.agreed_rent, v_monthly_rent), COALESCE(v_inv.deposit_amount, 0), 'ACTIVE',
           v_inv.invited_by, COALESCE(v_inv.billing_frequency, 'MONTHLY'), COALESCE(v_inv.period_anchor_day, EXTRACT(DAY FROM COALESCE(v_inv.tenancy_start_date, CURRENT_DATE))::int),
           v_inv.invoice_lead_days, v_inv.invoice_send_time
    WHERE NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id = v_inv.unit_id AND t.status = 'ACTIVE');
  END IF;
  UPDATE invitations SET status = 'ACCEPTED', accepted_at = NOW(), updated_at = NOW() WHERE id = p_token AND status = 'PENDING';
END;
$$;

CREATE OR REPLACE FUNCTION public.process_automated_billing()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_org RECORD; v_tenancy RECORD; v_target_due_date DATE; v_invoice_exists BOOLEAN;
    v_anchor_this_month DATE; v_anchor_next_month DATE; v_first_anchor DATE;
    v_invoice_start DATE; v_invoice_end DATE; v_anchor_day INT; v_invoice_lead_days INT;
    v_local_date DATE; v_local_time TIME; v_invoice_send_time TIME;
BEGIN
    FOR v_org IN SELECT id, COALESCE((settings->'billing'->>'grace_period_days')::int, 3) grace_period, COALESCE(timezone, 'Africa/Kigali') timezone FROM public.organisations LOOP
      v_local_date := timezone(v_org.timezone, now())::date;
      UPDATE public.invoices SET status='OVERDUE' WHERE org_id=v_org.id AND status='DUE' AND v_local_date > (due_date + (v_org.grace_period || ' days')::interval);
    END LOOP;
    FOR v_tenancy IN
      SELECT t.id,t.org_id,t.tenant_user_id,t.unit_id,t.agreed_rent,t.start_date,t.end_date,t.period_anchor_day,t.billing_frequency,t.invoice_lead_days,t.invoice_send_time,
             COALESCE((o.settings->'billing'->>'default_due_day')::int,1) org_default_due_day,
             COALESCE((o.settings->'billing'->>'default_invoice_lead_days')::int,7) org_default_invoice_lead_days,
             COALESCE((o.settings->'billing'->>'default_invoice_send_time')::time,time '08:00') org_default_invoice_send_time,
             COALESCE(o.timezone,'Africa/Kigali') org_timezone
      FROM public.tenancies t JOIN public.organisations o ON t.org_id=o.id WHERE t.status='ACTIVE'
    LOOP
      v_local_date := timezone(v_tenancy.org_timezone, now())::date;
      v_local_time := timezone(v_tenancy.org_timezone, now())::time;
      v_anchor_day := COALESCE(v_tenancy.period_anchor_day,v_tenancy.org_default_due_day);
      v_invoice_lead_days := COALESCE(v_tenancy.invoice_lead_days,v_tenancy.org_default_invoice_lead_days,7);
      v_invoice_send_time := COALESCE(v_tenancy.invoice_send_time,v_tenancy.org_default_invoice_send_time,time '08:00');
      IF v_anchor_day < 1 OR v_anchor_day > 31 THEN v_anchor_day := 1; END IF;
      IF v_invoice_lead_days < 0 OR v_invoice_lead_days > 30 THEN v_invoice_lead_days := 7; END IF;
      IF v_tenancy.billing_frequency <> 'MONTHLY' THEN CONTINUE; END IF;
      BEGIN v_anchor_this_month := make_date(extract(year from v_local_date)::int,extract(month from v_local_date)::int,v_anchor_day);
      EXCEPTION WHEN OTHERS THEN v_anchor_this_month := (date_trunc('month',v_local_date)+interval '1 month'-interval '1 day')::date; END;
      BEGIN v_anchor_next_month := make_date(extract(year from v_local_date+interval '1 month')::int,extract(month from v_local_date+interval '1 month')::int,v_anchor_day);
      EXCEPTION WHEN OTHERS THEN v_anchor_next_month := (date_trunc('month',v_local_date+interval '1 month')+interval '1 month'-interval '1 day')::date; END;
      BEGIN v_first_anchor := make_date(extract(year from v_tenancy.start_date)::int,extract(month from v_tenancy.start_date)::int,v_anchor_day);
      EXCEPTION WHEN OTHERS THEN v_first_anchor := (date_trunc('month',v_tenancy.start_date)+interval '1 month'-interval '1 day')::date; END;
      IF v_first_anchor < v_tenancy.start_date THEN
        BEGIN v_first_anchor := make_date(extract(year from v_tenancy.start_date+interval '1 month')::int,extract(month from v_tenancy.start_date+interval '1 month')::int,v_anchor_day);
        EXCEPTION WHEN OTHERS THEN v_first_anchor := (date_trunc('month',v_tenancy.start_date+interval '1 month')+interval '1 month'-interval '1 day')::date; END;
      END IF;
      SELECT EXISTS(SELECT 1 FROM public.invoices WHERE tenancy_id=v_tenancy.id) INTO v_invoice_exists;
      IF NOT v_invoice_exists AND v_local_date >= v_tenancy.start_date THEN v_target_due_date:=v_first_anchor;
      ELSIF v_local_time < v_invoice_send_time THEN CONTINUE;
      ELSIF v_local_date=(v_anchor_this_month-(v_invoice_lead_days||' days')::interval)::date THEN v_target_due_date:=v_anchor_this_month;
      ELSIF v_local_date=(v_anchor_next_month-(v_invoice_lead_days||' days')::interval)::date THEN v_target_due_date:=v_anchor_next_month;
      ELSE CONTINUE; END IF;
      IF v_tenancy.end_date IS NOT NULL AND v_target_due_date > v_tenancy.end_date THEN CONTINUE; END IF;
      SELECT EXISTS(SELECT 1 FROM public.invoices WHERE tenancy_id=v_tenancy.id AND due_date=v_target_due_date) INTO v_invoice_exists;
      IF NOT v_invoice_exists THEN
        v_invoice_start:=v_target_due_date; v_invoice_end:=(v_target_due_date+interval '1 month'-interval '1 day')::date;
        INSERT INTO public.invoices (org_id,tenancy_id,tenant_user_id,unit_id,invoice_number,amount_due,amount_paid,due_date,billing_period_start,billing_period_end,status,generated_by)
        VALUES (v_tenancy.org_id,v_tenancy.id,v_tenancy.tenant_user_id,v_tenancy.unit_id,public.generate_invoice_number(),v_tenancy.agreed_rent,0,v_target_due_date,v_invoice_start,v_invoice_end,'DUE','SCHEDULED');
      END IF;
    END LOOP;
END; $$;

DO $$ BEGIN
  PERFORM cron.unschedule('automated-billing-daily');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  PERFORM cron.unschedule('automated-billing-quarter-hourly');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN
  PERFORM cron.schedule('automated-billing-quarter-hourly','*/15 * * * *','SELECT public.process_automated_billing()');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
