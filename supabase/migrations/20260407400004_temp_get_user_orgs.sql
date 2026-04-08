CREATE OR REPLACE FUNCTION public.get_user_orgs(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(r)) INTO res
  FROM (
    SELECT uor.org_id, uor.role, o.name, o.subscription_status
    FROM user_organisation_roles uor
    JOIN organisations o ON o.id = uor.org_id
    WHERE uor.user_id = p_user_id
  ) r;
  RETURN res;
END;
$$;