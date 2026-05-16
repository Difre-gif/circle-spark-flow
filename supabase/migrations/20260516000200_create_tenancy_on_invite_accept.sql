-- When a tenant invitation already carries a unit assignment, accepting the
-- invitation should also create the active tenancy. This used to happen inside
-- the auth signup trigger; after decoupling signup from invite acceptance, the
-- correct home for that work is accept_invitation().

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
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_inv
  FROM invitations
  WHERE id = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invitation';
  END IF;

  IF v_inv.created_at < NOW() - INTERVAL '7 days' THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  SELECT email INTO v_auth_email
  FROM auth.users
  WHERE id = v_user_id;

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
  ON CONFLICT (user_id, org_id) DO UPDATE SET
    role        = EXCLUDED.role,
    is_active   = true,
    accepted_at = NOW();

  IF v_inv.unit_id IS NOT NULL AND v_inv.role = 'TENANT' THEN
    SELECT monthly_rent
    INTO v_monthly_rent
    FROM units
    WHERE id = v_inv.unit_id
      AND org_id = v_inv.org_id
      AND is_active = true;

    IF v_monthly_rent IS NULL THEN
      RAISE EXCEPTION 'Assigned unit is no longer available.';
    END IF;

    INSERT INTO tenancies (
      org_id,
      unit_id,
      tenant_user_id,
      start_date,
      agreed_rent,
      status,
      created_by
    )
    SELECT
      v_inv.org_id,
      v_inv.unit_id,
      v_user_id,
      CURRENT_DATE,
      v_monthly_rent,
      'ACTIVE',
      v_inv.invited_by
    WHERE NOT EXISTS (
      SELECT 1
      FROM tenancies t
      WHERE t.unit_id = v_inv.unit_id
        AND t.status = 'ACTIVE'
    );
  END IF;

  UPDATE invitations
  SET status = 'ACCEPTED', accepted_at = NOW(), updated_at = NOW()
  WHERE id = p_token
    AND status = 'PENDING';
END;
$$;
