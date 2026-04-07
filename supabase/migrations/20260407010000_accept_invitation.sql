-- Get invitation email securely for unauthenticated users
CREATE OR REPLACE FUNCTION public.get_invitation_email(p_token uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM invitations WHERE id = p_token AND status = 'PENDING';
  RETURN v_email;
END;
$$;

-- Accept invitation securely
CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_token uuid,
  p_name text,
  p_phone text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv record;
  v_user_id uuid;
  v_email text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_inv FROM invitations WHERE id = p_token AND status = 'PENDING';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

  IF lower(v_email) != lower(v_inv.email) THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address.';
  END IF;

  -- Create or update user profile
  INSERT INTO users (id, full_name, email, phone)
  VALUES (v_user_id, p_name, v_email, p_phone)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;

  -- Assign role in the organization
  INSERT INTO user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
  VALUES (v_user_id, v_inv.org_id, v_inv.role, true, NOW())
  ON CONFLICT (user_id, org_id, role) DO UPDATE SET is_active = true, accepted_at = NOW();

  -- Mark invitation as accepted
  UPDATE invitations SET status = 'ACCEPTED', accepted_at = NOW() WHERE id = p_token;
  
  RETURN true;
END;
$$;

-- Allow landlord to update and delete tenants in their org
CREATE OR REPLACE FUNCTION public.remove_tenant(p_tenant_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_organisation_roles 
    WHERE user_id = auth.uid() AND org_id = p_org_id AND role IN ('OWNER', 'MANAGER') AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Soft delete the role
  UPDATE user_organisation_roles 
  SET is_active = false 
  WHERE user_id = p_tenant_id AND org_id = p_org_id AND role = 'TENANT';

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tenant_profile(p_tenant_id uuid, p_org_id uuid, p_name text, p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_organisation_roles 
    WHERE user_id = auth.uid() AND org_id = p_org_id AND role IN ('OWNER', 'MANAGER') AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Ensure they are a tenant in this org
  IF NOT EXISTS (
    SELECT 1 FROM user_organisation_roles 
    WHERE user_id = p_tenant_id AND org_id = p_org_id AND role = 'TENANT' AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Tenant not found in this organization';
  END IF;

  UPDATE users 
  SET full_name = p_name, phone = p_phone 
  WHERE id = p_tenant_id;

  RETURN true;
END;
$$;
