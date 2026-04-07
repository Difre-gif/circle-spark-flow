-- 1. Add username to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- 2. Drop existing accept_invitation functions to avoid ambiguity
DROP FUNCTION IF EXISTS public.accept_invitation(uuid, text, text);
DROP FUNCTION IF EXISTS public.accept_invitation(uuid, text);
DROP FUNCTION IF EXISTS public.accept_invitation(uuid);

-- 3. Replace get_invitation_by_token to check expiry (7 days) and user existence
DROP FUNCTION IF EXISTS public.get_invitation_by_token(uuid);
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token uuid)
RETURNS TABLE (
  id uuid,
  email text,
  org_name text,
  unit_info text,
  role text,
  is_valid boolean,
  user_exists boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv RECORD;
  v_user_exists boolean;
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
    AND i.created_at >= NOW() - INTERVAL '7 days'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      NULL::uuid, NULL::text, NULL::text, NULL::text, NULL::text, false, false;
    RETURN;
  END IF;

  SELECT EXISTS(SELECT 1 FROM auth.users u WHERE lower(u.email) = lower(v_inv.email)) INTO v_user_exists;

  RETURN QUERY SELECT
    v_inv.id,
    v_inv.email::text,
    v_inv.org_nm::text,
    v_inv.u_info::text,
    v_inv.role::text,
    true::boolean,
    v_user_exists;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(uuid) TO anon, authenticated;

-- 4. Create new accept_invitation
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
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Validate token & expiry
  SELECT * INTO v_inv
  FROM invitations
  WHERE id = p_token AND status = 'PENDING';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  IF v_inv.created_at < NOW() - INTERVAL '7 days' THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  -- 2. Validate email matches
  SELECT email INTO v_auth_email FROM auth.users WHERE id = v_user_id;
  IF lower(v_auth_email) != lower(v_inv.email) THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address.';
  END IF;

  -- 3. Update the user's display name and username if provided
  UPDATE users SET 
    full_name = COALESCE(NULLIF(trim(p_full_name), ''), full_name),
    username = COALESCE(NULLIF(trim(p_username), ''), username)
  WHERE id = v_user_id;

  -- 4. Link user to the organisation with the invited role
  INSERT INTO user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
  VALUES (v_user_id, v_inv.org_id, v_inv.role, true, NOW())
  ON CONFLICT (user_id, org_id) DO UPDATE SET
    role        = EXCLUDED.role,
    is_active   = true,
    accepted_at = NOW();

  -- 5. Mark invitation as accepted
  UPDATE invitations SET status = 'ACCEPTED', accepted_at = NOW() WHERE id = p_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invitation(uuid, text, text) TO authenticated;

-- 5. Check username availability RPC
CREATE OR REPLACE FUNCTION public.check_username_available(p_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  IF p_username IS NULL OR trim(p_username) = '' THEN
    RETURN false;
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM users WHERE lower(username) = lower(p_username)) INTO v_exists;
  RETURN NOT v_exists;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;