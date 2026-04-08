-- Migration: Update Invoice Reminders Cron to Use Custom Days
-- Reads the days_before_due and days_after_due from org settings to fire reminders dynamically.

create or replace function public.process_invoice_reminders()
returns void as $$
declare
    invoice_record record;
    service_role_key text;
    supabase_url text;
begin
    supabase_url := 'https://ippbpimivjuabjijuwvv.supabase.co';
    -- Use the anon key to authenticate with the Edge Function
    service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcGJwaW1pdmp1YWJqaWp1d3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzMyMzIsImV4cCI6MjA5MDcwOTIzMn0.Bc8-WpWtiGSVqnMFMUu-rcE7yYVHGrXcl6Ce5ndMc2A'; 

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
                'Authorization', 'Bearer ' || service_role_key
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
                'Authorization', 'Bearer ' || service_role_key
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
