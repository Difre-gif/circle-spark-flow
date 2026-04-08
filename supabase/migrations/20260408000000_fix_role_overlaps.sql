-- Migration: Support Active Organization Context via Headers
-- This fixes the issue where users with multiple roles/organizations
-- were locked into the first organization returned by LIMIT 1.

CREATE OR REPLACE FUNCTION public.set_request_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_requested_org_id text;
  v_org_id uuid;
  v_role text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN; END IF;

  -- 1. Try to read the requested org from the custom header
  BEGIN
    v_requested_org_id := current_setting('request.headers', true)::json->>'x-org-id';
  EXCEPTION WHEN OTHERS THEN
    v_requested_org_id := NULL;
  END;

  -- 2. If a specific org is requested, validate the user has an active role in it
  IF v_requested_org_id IS NOT NULL AND v_requested_org_id != 'null' AND v_requested_org_id != '' THEN
    SELECT org_id, role::text INTO v_org_id, v_role
    FROM user_organisation_roles
    WHERE user_id = v_user_id AND org_id = v_requested_org_id::uuid AND is_active = true
    LIMIT 1;
  END IF;

  -- 3. Fallback: If no header is provided (e.g., initial login) or the requested org is invalid,
  -- default to the user's first active organization.
  IF v_org_id IS NULL THEN
    SELECT org_id, role::text INTO v_org_id, v_role
    FROM user_organisation_roles
    WHERE user_id = v_user_id AND is_active = true
    LIMIT 1;
  END IF;

  -- 4. Apply the context to the transaction
  IF v_org_id IS NOT NULL THEN
    PERFORM set_config('app.current_org_id', v_org_id::text, true);
    PERFORM set_config('app.user_role', v_role, true);
    PERFORM set_config('app.current_user_id', v_user_id::text, true);
  END IF;
END;
$$;
