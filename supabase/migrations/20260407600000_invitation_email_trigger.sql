CREATE OR REPLACE FUNCTION public.trigger_send_invitation_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_name text;
  v_inviter_name text;
  v_unit_info text;
  v_supabase_url text := 'https://ippbpimivjuabjijuwvv.supabase.co';
  v_service_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcGJwaW1pdmp1YWJqaWp1d3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzMyMzIsImV4cCI6MjA5MDcwOTIzMn0.Bc8-WpWtiGSVqnMFMUu-rcE7yYVHGrXcl6Ce5ndMc2A';
  v_payload jsonb;
  v_type text;
BEGIN
  -- Get organisation name
  SELECT name INTO v_org_name FROM organisations WHERE id = NEW.org_id;
  
  -- Get inviter name
  SELECT COALESCE(full_name, email) INTO v_inviter_name FROM users WHERE id = NEW.invited_by;
  
  -- Get unit info if applicable
  IF NEW.unit_id IS NOT NULL THEN
    SELECT p.name || ' — Unit ' || u.unit_number INTO v_unit_info
    FROM units u
    JOIN properties p ON p.id = u.property_id
    WHERE u.id = NEW.unit_id;
  END IF;

  -- Determine email type
  IF NEW.role = 'TENANT' THEN
    v_type := 'tenant-invitation';
  ELSE
    v_type := 'staff-invitation';
  END IF;

  -- Build payload
  v_payload := jsonb_build_object(
    'to', NEW.email,
    'type', v_type,
    'data', jsonb_build_object(
      'orgName', COALESCE(v_org_name, 'BizRent'),
      'inviterName', COALESCE(v_inviter_name, 'Management'),
      'unitInfo', v_unit_info,
      'role', NEW.role,
      'invitationId', NEW.id
    )
  );

  -- Send HTTP POST to Edge Function
  PERFORM net.http_post(
    url := v_supabase_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
    ),
    body := v_payload
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_send_invitation_email ON public.invitations;
CREATE TRIGGER tr_send_invitation_email
  AFTER INSERT ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_send_invitation_email();
