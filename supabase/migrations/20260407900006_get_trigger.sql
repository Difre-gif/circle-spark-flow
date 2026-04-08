CREATE OR REPLACE FUNCTION public.get_on_auth_user_created_def()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO res
  FROM pg_proc p
  WHERE proname = 'handle_new_user';
  RETURN res;
END;
$$;