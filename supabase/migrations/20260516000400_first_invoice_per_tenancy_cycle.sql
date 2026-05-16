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
    v_first_anchor DATE;
    v_invoice_start DATE;
    v_invoice_end DATE;
    v_anchor_day INT;
BEGIN
    FOR v_org IN SELECT id, COALESCE((settings->'billing'->>'grace_period_days')::int, 3) as grace_period FROM public.organisations LOOP
        UPDATE public.invoices
        SET status = 'OVERDUE'
        WHERE org_id = v_org.id AND status = 'DUE'
          AND current_date > (due_date + (v_org.grace_period || ' days')::interval);
    END LOOP;

    FOR v_tenancy IN
        SELECT t.id, t.org_id, t.tenant_user_id, t.unit_id, t.agreed_rent, t.start_date,
               t.period_anchor_day, t.billing_frequency,
               COALESCE((o.settings->'billing'->>'default_due_day')::int, 1) as org_default_due_day
        FROM public.tenancies t JOIN public.organisations o ON t.org_id = o.id
        WHERE t.status = 'ACTIVE'
    LOOP
        v_anchor_day := COALESCE(v_tenancy.period_anchor_day, v_tenancy.org_default_due_day);
        IF v_anchor_day < 1 OR v_anchor_day > 31 THEN v_anchor_day := 1; END IF;
        IF v_tenancy.billing_frequency <> 'MONTHLY' THEN CONTINUE; END IF;

        BEGIN
            v_anchor_this_month := make_date(extract(year from current_date)::int, extract(month from current_date)::int, v_anchor_day);
        EXCEPTION WHEN OTHERS THEN
            v_anchor_this_month := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
        END;
        BEGIN
            v_anchor_next_month := make_date(extract(year from current_date + interval '1 month')::int, extract(month from current_date + interval '1 month')::int, v_anchor_day);
        EXCEPTION WHEN OTHERS THEN
            v_anchor_next_month := (date_trunc('month', current_date + interval '1 month') + interval '1 month' - interval '1 day')::date;
        END;

        BEGIN
            v_first_anchor := make_date(extract(year from v_tenancy.start_date)::int, extract(month from v_tenancy.start_date)::int, v_anchor_day);
        EXCEPTION WHEN OTHERS THEN
            v_first_anchor := (date_trunc('month', v_tenancy.start_date) + interval '1 month' - interval '1 day')::date;
        END;
        IF v_first_anchor < v_tenancy.start_date THEN
            BEGIN
                v_first_anchor := make_date(extract(year from v_tenancy.start_date + interval '1 month')::int, extract(month from v_tenancy.start_date + interval '1 month')::int, v_anchor_day);
            EXCEPTION WHEN OTHERS THEN
                v_first_anchor := (date_trunc('month', v_tenancy.start_date + interval '1 month') + interval '1 month' - interval '1 day')::date;
            END;
        END IF;

        SELECT EXISTS(SELECT 1 FROM public.invoices WHERE tenancy_id = v_tenancy.id) INTO v_invoice_exists;
        IF NOT v_invoice_exists AND current_date >= v_tenancy.start_date THEN
            v_target_due_date := v_first_anchor;
        ELSIF current_date = (v_anchor_this_month - interval '7 days')::date THEN
            v_target_due_date := v_anchor_this_month;
        ELSIF current_date = (v_anchor_next_month - interval '7 days')::date THEN
            v_target_due_date := v_anchor_next_month;
        ELSE
            CONTINUE;
        END IF;

        SELECT EXISTS(SELECT 1 FROM public.invoices WHERE tenancy_id = v_tenancy.id AND due_date = v_target_due_date) INTO v_invoice_exists;
        IF NOT v_invoice_exists THEN
            v_invoice_start := v_target_due_date;
            v_invoice_end := (v_target_due_date + interval '1 month' - interval '1 day')::date;
            INSERT INTO public.invoices (
                org_id, tenancy_id, tenant_user_id, unit_id, invoice_number, amount_due, amount_paid,
                due_date, billing_period_start, billing_period_end, status, generated_by
            ) VALUES (
                v_tenancy.org_id, v_tenancy.id, v_tenancy.tenant_user_id, v_tenancy.unit_id,
                public.generate_invoice_number(), v_tenancy.agreed_rent, 0, v_target_due_date,
                v_invoice_start, v_invoice_end, 'DUE', 'SCHEDULED'
            );
        END IF;
    END LOOP;
END;
$$;
