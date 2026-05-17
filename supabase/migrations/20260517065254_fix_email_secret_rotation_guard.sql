CREATE OR REPLACE FUNCTION public.get_email_internal_secret_for_rotation()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') <> 'service_role' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN (
    SELECT secret_value
    FROM private.app_secrets
    WHERE secret_key = 'email_internal_secret'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_internal_secret_for_rotation() TO service_role;
