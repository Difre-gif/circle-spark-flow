-- Removing a tenant keeps historical records, but landlords may choose to
-- write off unpaid invoices while removing the tenant from active use.

CREATE OR REPLACE FUNCTION public.remove_tenant_from_org(
  p_tenant_user_id uuid,
  p_org_id uuid,
  p_write_off_outstanding boolean DEFAULT false
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

  IF p_write_off_outstanding THEN
    UPDATE invoices
    SET status = 'CANCELLED'
    WHERE tenant_user_id = p_tenant_user_id
      AND org_id = p_org_id
      AND status IN ('DUE', 'OVERDUE', 'PARTIAL');
  END IF;

  UPDATE user_organisation_roles
  SET is_active = false
  WHERE user_id = p_tenant_user_id
    AND org_id = p_org_id;

  UPDATE tenancies
  SET status = 'TERMINATED',
      end_date = CASE WHEN start_date < CURRENT_DATE THEN CURRENT_DATE ELSE NULL END,
      terminated_at = NOW(),
      terminated_by = auth.uid(),
      termination_reason = COALESCE(
        termination_reason,
        CASE
          WHEN p_write_off_outstanding THEN 'Removed from organisation; outstanding balance written off'
          ELSE 'Removed from organisation'
        END
      )
  WHERE tenant_user_id = p_tenant_user_id
    AND org_id = p_org_id
    AND status = 'ACTIVE';
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_tenant_from_org(uuid, uuid, boolean) TO authenticated;
