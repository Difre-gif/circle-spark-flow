-- Migration: Fix Accept Invitation Race Condition
-- The handle_new_auth_user trigger automatically links users to their orgs upon signup.
-- The frontend accept_invitation RPC was crashing because it tried to re-insert 
-- the user into user_organisation_roles, causing conflicts. This updates the RPC to gracefully handle it.

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

  -- 1. Validate token & get invitation details
  -- We don't filter by status = 'PENDING' strictly here anymore, because the
  -- handle_new_auth_user trigger might have ALREADY marked it 'ACCEPTED' a second ago.
  SELECT * INTO v_inv
  FROM invitations
  WHERE id = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invitation';
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
  -- The ON CONFLICT handles the case where the DB Trigger already did this.
  INSERT INTO user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
  VALUES (v_user_id, v_inv.org_id, v_inv.role, true, NOW())
  ON CONFLICT (user_id, org_id) DO UPDATE SET
    role        = EXCLUDED.role,
    is_active   = true,
    accepted_at = NOW();

  -- 5. Mark invitation as accepted (in case the trigger missed it or it's an existing user)
  UPDATE invitations SET status = 'ACCEPTED', accepted_at = NOW() WHERE id = p_token AND status = 'PENDING';
END;
$$;
