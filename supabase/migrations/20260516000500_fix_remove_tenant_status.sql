-- Fix stale tenancy status used by tenant removal helper.
-- tenancy_status_enum only permits ACTIVE, TERMINATED, and EXPIRED.

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
  WHERE user_id = auth.uid()
    AND org_id = p_org_id
    AND is_active = true
  LIMIT 1;

  IF v_caller_role NOT IN ('OWNER', 'MANAGER') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE user_organisation_roles
  SET is_active = false
  WHERE user_id = p_tenant_user_id
    AND org_id = p_org_id;

  -- Soft-end active tenancies while preserving history.
  UPDATE tenancies
  SET status = 'TERMINATED',
      end_date = CURRENT_DATE,
      terminated_at = NOW(),
      terminated_by = auth.uid(),
      termination_reason = COALESCE(termination_reason, 'Removed from organisation')
  WHERE tenant_user_id = p_tenant_user_id
    AND org_id = p_org_id
    AND status = 'ACTIVE';
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_tenant_from_org(uuid, uuid) TO authenticated;
