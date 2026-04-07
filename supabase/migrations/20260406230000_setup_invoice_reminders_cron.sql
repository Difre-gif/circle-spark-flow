
-- Enable pg_cron and pg_net
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Function to process and send invoice reminders
create or replace function public.process_invoice_reminders()
returns void as $$
declare
    invoice_record record;
    service_role_key text;
    supabase_url text;
begin
    -- Get project settings from environment (or hardcode for migration if necessary)
    -- In Supabase, the URL and Service Role Key are usually available or can be set as vault secrets
    -- For this implementation, we assume they are configured in the database via secrets or accessible.
    -- Better practice: Use Vault or replace placeholders with actual values if known, 
    -- but pg_net can use local calls in some environments.
    
    supabase_url := 'https://ippbpimivjuabjijuwvv.supabase.co';
    -- Use the anon key to authenticate with the Edge Function
    service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcGJwaW1pdmp1YWJqaWp1d3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzMyMzIsImV4cCI6MjA5MDcwOTIzMn0.Bc8-WpWtiGSVqnMFMUu-rcE7yYVHGrXcl6Ce5ndMc2A'; 

    -- 1. Send reminders for invoices due in exactly 3 days (that haven't been sent yet)
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
          and i.due_date = (current_date + interval '3 days')
          and i.last_3day_reminder_sent_at is null
    loop
        perform net.http_post(
            url := supabase_url || '/functions/v1/send-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key
            ),
            body := jsonb_build_object(
                'to', invoice_record.tenant_email,
                'type', 'invoice-due',
                'data', jsonb_build_object(
                    'tenantName', invoice_record.tenant_name,
                    'invoiceNumber', invoice_record.invoice_number,
                    'dueDate', to_char(invoice_record.due_date, 'DD Month YYYY'),
                    'amountDue', invoice_record.amount_due,
                    'propertyUnit', invoice_record.property_name || ' — Unit ' || invoice_record.unit_number,
                    'period', to_char(invoice_record.billing_period_start, 'DD Mon') || ' - ' || to_char(invoice_record.billing_period_end, 'DD Mon YYYY')
                )
            )
        );

        update public.invoices 
        set last_3day_reminder_sent_at = now() 
        where id = invoice_record.id;
    end loop;

    -- 2. Send reminders for overdue invoices (that haven't been sent in the last 7 days)
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
          and (i.last_7day_reminder_sent_at is null or i.last_7day_reminder_sent_at < (now() - interval '7 days'))
    loop
        perform net.http_post(
            url := supabase_url || '/functions/v1/send-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key
            ),
            body := jsonb_build_object(
                'to', invoice_record.tenant_email,
                'type', 'overdue-alert',
                'data', jsonb_build_object(
                    'tenantName', invoice_record.tenant_name,
                    'invoiceNumber', invoice_record.invoice_number,
                    'dueDate', to_char(invoice_record.due_date, 'DD Month YYYY'),
                    'amountDue', invoice_record.amount_due,
                    'propertyUnit', invoice_record.property_name || ' — Unit ' || invoice_record.unit_number,
                    'period', to_char(invoice_record.billing_period_start, 'DD Mon') || ' - ' || to_char(invoice_record.billing_period_end, 'DD Mon YYYY')
                )
            )
        );

        update public.invoices 
        set last_7day_reminder_sent_at = now() 
        where id = invoice_record.id;
    end loop;
end;
$$ language plpgsql security definer;

-- Schedule the job to run every day at 8:00 AM UTC
select cron.schedule(
    'invoice-reminders-daily',
    '0 8 * * *',
    'select public.process_invoice_reminders()'
);
