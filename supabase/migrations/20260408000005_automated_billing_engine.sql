-- Migration: Automated Billing Engine & Smart Status Escalation
-- Implements the daily cron job for generating invoices and escalating overdue status based on org settings.

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.process_automated_billing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org RECORD;
    v_tenancy RECORD;
    v_target_due_date DATE;
    v_invoice_exists BOOLEAN;
    v_anchor_this_month DATE;
    v_anchor_next_month DATE;
    v_invoice_start DATE;
    v_invoice_end DATE;
    v_anchor_day INT;
    v_generated_by uuid;
BEGIN
    -- 1. Status Escalation (DUE -> OVERDUE based on org grace period)
    FOR v_org IN SELECT id, COALESCE((settings->'billing'->>'grace_period_days')::int, 3) as grace_period FROM public.organisations LOOP
        UPDATE public.invoices
        SET status = 'OVERDUE'
        WHERE org_id = v_org.id
          AND status = 'DUE'
          AND current_date > (due_date + (v_org.grace_period || ' days')::interval);
    END LOOP;

    -- 2. Automated Invoice Generation (7 days before due date)
    FOR v_tenancy IN 
        SELECT t.id, t.org_id, t.tenant_user_id, t.unit_id, t.agreed_rent, t.period_anchor_day, t.billing_frequency,
               COALESCE((o.settings->'billing'->>'default_due_day')::int, 1) as org_default_due_day
        FROM public.tenancies t
        JOIN public.organisations o ON t.org_id = o.id
        WHERE t.status = 'ACTIVE'
    LOOP
        -- Find an owner or manager of the org to act as the "generated_by" user
        SELECT user_id INTO v_generated_by FROM public.user_organisation_roles 
        WHERE org_id = v_tenancy.org_id AND role IN ('OWNER', 'SUPER_ADMIN') AND is_active = true LIMIT 1;
        
        IF v_generated_by IS NULL THEN
            CONTINUE; -- Can't generate without a valid user
        END IF;

        -- Determine the anchor day to use (tenancy override or org default)
        v_anchor_day := COALESCE(v_tenancy.period_anchor_day, v_tenancy.org_default_due_day);
        IF v_anchor_day < 1 OR v_anchor_day > 31 THEN
            v_anchor_day := 1;
        END IF;

        IF v_tenancy.billing_frequency = 'MONTHLY' THEN
            -- Calculate anchor date for current month
            BEGIN
                v_anchor_this_month := make_date(extract(year from current_date)::int, extract(month from current_date)::int, v_anchor_day);
            EXCEPTION WHEN OTHERS THEN
                v_anchor_this_month := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
            END;

            -- Calculate anchor date for next month
            BEGIN
                v_anchor_next_month := make_date(extract(year from current_date + interval '1 month')::int, extract(month from current_date + interval '1 month')::int, v_anchor_day);
            EXCEPTION WHEN OTHERS THEN
                v_anchor_next_month := (date_trunc('month', current_date + interval '1 month') + interval '1 month' - interval '1 day')::date;
            END;

            -- Trigger exactly 7 days before the anchor date
            IF current_date = (v_anchor_this_month - interval '7 days')::date THEN
                v_target_due_date := v_anchor_this_month;
            ELSIF current_date = (v_anchor_next_month - interval '7 days')::date THEN
                v_target_due_date := v_anchor_next_month;
            ELSE
                CONTINUE;
            END IF;

            -- Prevent duplicate invoices
            SELECT EXISTS(
                SELECT 1 FROM public.invoices 
                WHERE tenancy_id = v_tenancy.id AND due_date = v_target_due_date
            ) INTO v_invoice_exists;

            IF NOT v_invoice_exists THEN
                v_invoice_start := v_target_due_date;
                v_invoice_end := (v_target_due_date + interval '1 month' - interval '1 day')::date;

                INSERT INTO public.invoices (
                    org_id, tenancy_id, tenant_user_id, unit_id,
                    invoice_number, amount_due, amount_paid, due_date,
                    billing_period_start, billing_period_end, status, generated_by
                ) VALUES (
                    v_tenancy.org_id, v_tenancy.id, v_tenancy.tenant_user_id, v_tenancy.unit_id,
                    public.generate_invoice_number(), v_tenancy.agreed_rent, 0, v_target_due_date,
                    v_invoice_start, v_invoice_end, 'DUE', v_generated_by
                );
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- Schedule it to run daily at 1:00 AM UTC
DO $$ BEGIN
    PERFORM cron.schedule(
        'automated-billing-daily',
        '0 1 * * *',
        'SELECT public.process_automated_billing()'
    );
EXCEPTION WHEN OTHERS THEN
    NULL; -- pg_cron might not be enabled on local or it's already scheduled
END $$;
