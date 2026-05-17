-- Secure internal dispatch for email automation without committing a plaintext secret.

CREATE TABLE IF NOT EXISTS private.app_secrets (
  secret_key text PRIMARY KEY,
  secret_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  rotated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON private.app_secrets FROM PUBLIC;

INSERT INTO private.app_secrets (secret_key, secret_value)
VALUES (
  'email_internal_secret',
  md5(random()::text || clock_timestamp()::text) ||
  md5(random()::text || clock_timestamp()::text)
)
ON CONFLICT (secret_key) DO NOTHING;

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

create or replace function public.process_invoice_reminders()
returns void as $$
declare
    invoice_record record;
    service_role_key text;
    supabase_url text;
    internal_email_secret text;
begin
    supabase_url := 'https://ippbpimivjuabjijuwvv.supabase.co';
    -- Use the anon key to authenticate with the Edge Function
    service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcGJwaW1pdmp1YWJqaWp1d3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzMyMzIsImV4cCI6MjA5MDcwOTIzMn0.Bc8-WpWtiGSVqnMFMUu-rcE7yYVHGrXcl6Ce5ndMc2A';
    SELECT secret_value INTO internal_email_secret
    FROM private.app_secrets
    WHERE secret_key = 'email_internal_secret';

    -- 1. Send reminders for invoices DUE in the configured 'days_before_due'
    -- (e.g. if the list is [7, 3, 1], it will send a reminder on exactly those days before the due_date)
    for invoice_record in 
        select 
            i.id,
            i.invoice_number,
            i.due_date,
            i.amount_due,
            i.billing_period_start,
            i.billing_period_end,
            u.full_name as tenant_name,
            u.email as tenant_email,
            p.name as property_name,
            un.unit_number,
            o.name as org_name
        from public.invoices i
        join public.users u on i.tenant_user_id = u.id
        join public.units un on i.unit_id = un.id
        join public.properties p on un.property_id = p.id
        join public.organisations o on i.org_id = o.id
        where i.status = 'DUE'
          -- Check if the exact difference between current_date and due_date exists in the days_before_due JSON array
          and (i.due_date - current_date) IN (SELECT jsonb_array_elements_text(COALESCE(o.settings->'reminders'->'days_before_due', '[3]'))::int)
          and COALESCE((u.notification_prefs->>'invoice_reminders')::boolean, true) = true
          -- Make sure we haven't already sent a reminder TODAY to prevent spam loops if the cron runs twice
          and (i.last_3day_reminder_sent_at is null or i.last_3day_reminder_sent_at::date != current_date)
    loop
        perform net.http_post(
            url := supabase_url || '/functions/v1/send-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key,
                'x-bizrent-internal-secret', internal_email_secret
            ),
            body := jsonb_build_object(
                'to', invoice_record.tenant_email,
                'type', 'invoice-due',
                'data', jsonb_build_object(
                    'tenantName', invoice_record.tenant_name,
                    'orgName', invoice_record.org_name,
                    'invoiceNumber', invoice_record.invoice_number,
                    'dueDate', to_char(invoice_record.due_date, 'YYYY-MM-DD'),
                    'amountDue', invoice_record.amount_due,
                    'propertyUnit', invoice_record.property_name || ' — Unit ' || invoice_record.unit_number,
                    'period', to_char(invoice_record.billing_period_start, 'YYYY-MM-DD')
                )
            )
        );

        update public.invoices 
        set last_3day_reminder_sent_at = now() 
        where id = invoice_record.id;
    end loop;

    -- 2. Send reminders for invoices that are OVERDUE based on 'days_after_due'
    -- (e.g. if the list is [1, 5, 10], it will send a reminder exactly 1, 5, and 10 days AFTER the due date)
    for invoice_record in 
        select 
            i.id,
            i.invoice_number,
            i.due_date,
            i.amount_due,
            i.billing_period_start,
            i.billing_period_end,
            u.full_name as tenant_name,
            u.email as tenant_email,
            p.name as property_name,
            un.unit_number,
            o.name as org_name
        from public.invoices i
        join public.users u on i.tenant_user_id = u.id
        join public.units un on i.unit_id = un.id
        join public.properties p on un.property_id = p.id
        join public.organisations o on i.org_id = o.id
        where i.status = 'OVERDUE'
          -- Check if the exact difference exists in the days_after_due array
          and (current_date - i.due_date) IN (SELECT jsonb_array_elements_text(COALESCE(o.settings->'reminders'->'days_after_due', '[1, 5, 10]'))::int)
          and COALESCE((u.notification_prefs->>'overdue_invoices')::boolean, true) = true
          and (i.last_7day_reminder_sent_at is null or i.last_7day_reminder_sent_at::date != current_date)
    loop
        perform net.http_post(
            url := supabase_url || '/functions/v1/send-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key,
                'x-bizrent-internal-secret', internal_email_secret
            ),
            body := jsonb_build_object(
                'to', invoice_record.tenant_email,
                'type', 'invoice-overdue',
                'data', jsonb_build_object(
                    'tenantName', invoice_record.tenant_name,
                    'orgName', invoice_record.org_name,
                    'invoiceNumber', invoice_record.invoice_number,
                    'dueDate', to_char(invoice_record.due_date, 'YYYY-MM-DD'),
                    'amountDue', invoice_record.amount_due,
                    'daysOverdue', (current_date - invoice_record.due_date),
                    'propertyUnit', invoice_record.property_name || ' — Unit ' || invoice_record.unit_number,
                    'period', to_char(invoice_record.billing_period_start, 'YYYY-MM-DD')
                )
            )
        );

        update public.invoices 
        set last_7day_reminder_sent_at = now() 
        where id = invoice_record.id;
    end loop;
end;
$$ language plpgsql security definer;

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
  v_internal_email_secret text;
  v_payload jsonb;
  v_type text;
BEGIN
  SELECT secret_value INTO v_internal_email_secret
  FROM private.app_secrets
  WHERE secret_key = 'email_internal_secret';
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
        'Authorization', 'Bearer ' || v_service_key,
        'x-bizrent-internal-secret', v_internal_email_secret
    ),
    body := v_payload
  );

  RETURN NEW;
END;
$$;
