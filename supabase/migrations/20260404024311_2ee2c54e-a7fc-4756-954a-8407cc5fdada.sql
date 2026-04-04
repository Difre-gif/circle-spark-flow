
-- Pre-request function: automatically sets org context from JWT before every PostgREST query
-- This makes all existing RLS policies work seamlessly with the frontend
CREATE OR REPLACE FUNCTION public.set_request_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_role text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN; END IF;

  SELECT org_id, role::text INTO v_org_id, v_role
  FROM user_organisation_roles
  WHERE user_id = v_user_id AND is_active = true
  LIMIT 1;

  IF v_org_id IS NOT NULL THEN
    PERFORM set_config('app.current_org_id', v_org_id::text, true);
    PERFORM set_config('app.user_role', v_role, true);
    PERFORM set_config('app.current_user_id', v_user_id::text, true);
  END IF;
END;
$$;

-- Tell PostgREST to call this function before every request
ALTER ROLE authenticator SET pgrst.db_pre_request = 'set_request_context';

-- Reload PostgREST config
NOTIFY pgrst, 'reload config';

-- Create payment-proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment-proofs bucket
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Authenticated users can view payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs');
