CREATE OR REPLACE FUNCTION public.get_auth_triggers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res jsonb;
BEGIN
  SELECT jsonb_agg(row_to_json(t)) INTO res
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'auth' AND c.relname = 'users';
  RETURN res;
END;
$$;