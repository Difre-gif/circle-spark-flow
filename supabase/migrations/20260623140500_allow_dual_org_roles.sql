-- Allow the same user to hold separate roles in the same organisation.
-- This is required when a landlord is also a tenant in one of their own units.

ALTER TABLE public.user_organisation_roles
  DROP CONSTRAINT IF EXISTS user_organisation_roles_user_id_org_id_key;

DROP INDEX IF EXISTS public.user_organisation_roles_user_id_org_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS user_organisation_roles_user_id_org_id_role_key
  ON public.user_organisation_roles (user_id, org_id, role);

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
  IF lower(v_auth_email) != lower(v_inv.email) THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address.';
  END IF;

  UPDATE users
  SET
    full_name = COALESCE(NULLIF(trim(p_full_name), ''), full_name),
    username = COALESCE(NULLIF(trim(p_username), ''), username)
  WHERE id = v_user_id;

  INSERT INTO user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
  VALUES (v_user_id, v_inv.org_id, v_inv.role, true, NOW())
  ON CONFLICT (user_id, org_id, role) DO UPDATE SET
    is_active = true,
    accepted_at = NOW();

  IF v_inv.unit_id IS NOT NULL AND v_inv.role = 'TENANT' THEN
    SELECT monthly_rent INTO v_monthly_rent
    FROM units
    WHERE id = v_inv.unit_id AND org_id = v_inv.org_id AND is_active = true;

    IF v_monthly_rent IS NULL THEN RAISE EXCEPTION 'Assigned unit is no longer available.'; END IF;

    INSERT INTO tenancies (
      org_id,
      unit_id,
      tenant_user_id,
      start_date,
      agreed_rent,
      deposit_amount,
      status,
      created_by,
      billing_frequency,
      period_anchor_day,
      invoice_lead_days,
      invoice_send_time
    )
    SELECT
      v_inv.org_id,
      v_inv.unit_id,
      v_user_id,
      COALESCE(v_inv.tenancy_start_date, CURRENT_DATE),
      COALESCE(v_inv.agreed_rent, v_monthly_rent),
      COALESCE(v_inv.deposit_amount, 0),
      'ACTIVE',
      v_inv.invited_by,
      COALESCE(v_inv.billing_frequency, 'MONTHLY'),
      COALESCE(v_inv.period_anchor_day, EXTRACT(DAY FROM COALESCE(v_inv.tenancy_start_date, CURRENT_DATE))::int),
      v_inv.invoice_lead_days,
      v_inv.invoice_send_time
    WHERE NOT EXISTS (
      SELECT 1 FROM tenancies t WHERE t.unit_id = v_inv.unit_id AND t.status = 'ACTIVE'
    );
  END IF;

  UPDATE invitations
  SET status = 'ACCEPTED', accepted_at = NOW(), updated_at = NOW()
  WHERE id = p_token AND status = 'PENDING';
END;
$$;

-- Repair the current production account that created the organisation but was
-- later reduced to TENANT by the old (user_id, org_id) conflict target.
INSERT INTO public.user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
SELECT
  u.id,
  o.id,
  'OWNER'::public.user_role_enum,
  true,
  NOW()
FROM public.users u
JOIN public.organisations o
  ON o.id = 'cbf57f40-b274-42a0-a1e9-c417d1ad8509'::uuid
WHERE lower(u.email) = lower('fredrickk28@uwcea.org')
  AND lower(o.email) = lower(u.email)
ON CONFLICT (user_id, org_id, role) DO UPDATE SET
  is_active = true,
  accepted_at = COALESCE(public.user_organisation_roles.accepted_at, NOW());
