-- ============================================================
-- 1. get_invitation_by_token — public (SECURITY DEFINER),
--    allows the accept-invite page to read invite details
--    without the user being logged in yet.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token uuid)
RETURNS TABLE (
  id uuid,
  email text,
  org_name text,
  unit_info text,
  role text,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv RECORD;
BEGIN
  SELECT
    i.id,
    i.email,
    o.name AS org_nm,
    CASE WHEN i.unit_id IS NOT NULL
      THEN p.name || ' — Unit ' || u.unit_number
      ELSE NULL
    END AS u_info,
    i.role::text
  INTO v_inv
  FROM invitations i
  JOIN organisations o ON o.id = i.org_id
  LEFT JOIN units u ON u.id = i.unit_id
  LEFT JOIN properties p ON p.id = u.property_id
  WHERE i.id = p_token
    AND i.status = 'PENDING'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      NULL::uuid, NULL::text, NULL::text, NULL::text, NULL::text, false;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    v_inv.id,
    v_inv.email::text,
    v_inv.org_nm::text,
    v_inv.u_info::text,
    v_inv.role::text,
    true::boolean;
END;
$$;

-- Grant execute to anon and authenticated so the accept-invite
-- page can call it before and after the user is logged in.
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(uuid) TO anon, authenticated;


-- ============================================================
-- 2. accept_invitation — called after the user has signed up
--    (or signed in) to complete the invitation linkage.
-- ============================================================
CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_token uuid,
  p_full_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_inv RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_inv
  FROM invitations
  WHERE id = p_token AND status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Update the user's display name if provided
  IF p_full_name IS NOT NULL AND trim(p_full_name) != '' THEN
    UPDATE users SET full_name = trim(p_full_name) WHERE id = v_user_id;
  END IF;

  -- Link user to the organisation with the invited role
  INSERT INTO user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
  VALUES (v_user_id, v_inv.org_id, v_inv.role, true, NOW())
  ON CONFLICT (user_id, org_id) DO UPDATE SET
    role        = EXCLUDED.role,
    is_active   = true,
    accepted_at = NOW();

  -- Mark invitation as accepted
  UPDATE invitations SET status = 'ACCEPTED' WHERE id = p_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invitation(uuid, text) TO authenticated;


-- ============================================================
-- 3. cancel_invitation — landlord cancels a pending invite
-- ============================================================
CREATE OR REPLACE FUNCTION public.cancel_invitation(p_invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_caller_role text;
BEGIN
  -- Verify caller is OWNER or MANAGER of the invitation's org
  SELECT i.org_id INTO v_org_id
  FROM invitations i
  WHERE i.id = p_invitation_id AND i.status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  SELECT role::text INTO v_caller_role
  FROM user_organisation_roles
  WHERE user_id = auth.uid() AND org_id = v_org_id AND is_active = true
  LIMIT 1;

  IF v_caller_role NOT IN ('OWNER', 'MANAGER') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  DELETE FROM invitations WHERE id = p_invitation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_invitation(uuid) TO authenticated;


-- ============================================================
-- 4. remove_tenant_from_org — deactivates a tenant's role
--    (soft delete — preserves invoice & payment history)
-- ============================================================
CREATE OR REPLACE FUNCTION public.remove_tenant_from_org(
  p_tenant_user_id uuid,
  p_org_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role text;
BEGIN
  SELECT role::text INTO v_caller_role
  FROM user_organisation_roles
  WHERE user_id = auth.uid() AND org_id = p_org_id AND is_active = true
  LIMIT 1;

  IF v_caller_role NOT IN ('OWNER', 'MANAGER') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE user_organisation_roles
  SET is_active = false
  WHERE user_id = p_tenant_user_id AND org_id = p_org_id;

  -- End any active tenancies for this tenant in this org
  UPDATE tenancies SET status = 'ENDED', end_date = CURRENT_DATE
  WHERE tenant_user_id = p_tenant_user_id
    AND org_id = p_org_id
    AND status = 'ACTIVE';
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_tenant_from_org(uuid, uuid) TO authenticated;
