CREATE OR REPLACE FUNCTION public.get_trigger_func_def()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res text;
BEGIN
  SELECT pg_get_functiondef(t.tgfoid) INTO res
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'auth' AND c.relname = 'users' AND t.tgname = 'on_auth_user_created';
  RETURN res;
END;
$$;