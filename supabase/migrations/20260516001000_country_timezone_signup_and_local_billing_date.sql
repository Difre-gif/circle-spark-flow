-- Capture landlord country at signup and evaluate invoice timing using the workspace timezone.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_org_name TEXT;
    v_org_slug TEXT;
    v_org_id uuid;
    v_country_code text;
    v_currency_code text;
    v_timezone text;
BEGIN
    INSERT INTO public.users (
      id, email, full_name, phone, password_hash, is_active, is_email_verified, preferred_language, created_at, updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), SPLIT_PART(NEW.email, '@', 1)),
      NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
      '',
      TRUE,
      (NEW.email_confirmed_at IS NOT NULL),
      'en',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    v_org_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'organisation_name'), '');
    IF v_org_name IS NOT NULL THEN
      v_org_slug := lower(regexp_replace(v_org_name, '[^a-zA-Z0-9]+', '-', 'g'));
      v_org_slug := trim(both '-' from v_org_slug) || '-' || trunc(extract(epoch from now()))::text;

      v_country_code := CASE UPPER(COALESCE(NEW.raw_user_meta_data->>'country_code', 'RW'))
        WHEN 'KE' THEN 'KE'
        ELSE 'RW'
      END;
      v_currency_code := CASE v_country_code WHEN 'KE' THEN 'KES' ELSE 'RWF' END;
      v_timezone := CASE v_country_code WHEN 'KE' THEN 'Africa/Nairobi' ELSE 'Africa/Kigali' END;

      INSERT INTO public.organisations (name, slug, email, phone, country_code, currency_code, timezone, subscription_status)
      VALUES (
        v_org_name,
        v_org_slug,
        NEW.email,
        NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
        v_country_code,
        v_currency_code,
        v_timezone,
        'TRIAL'
      )
      RETURNING id INTO v_org_id;

      INSERT INTO public.user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
      VALUES (NEW.id, v_org_id, 'OWNER', true, NOW());

      INSERT INTO public.subscriptions (org_id, tier, billing_cycle, amount, status, trial_ends_at)
      VALUES (v_org_id, 'STARTER', 'MONTHLY', 0, 'TRIAL', NOW() + INTERVAL '30 days');

      UPDATE public.organisations
      SET trial_ends_at = NOW() + INTERVAL '30 days'
      WHERE id = v_org_id;
    END IF;

    RETURN NEW;
END;
$function$;

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
    v_invoice_lead_days INT;
    v_local_date DATE;
BEGIN
    FOR v_org IN
      SELECT id,
             COALESCE((settings->'billing'->>'grace_period_days')::int, 3) as grace_period,
             COALESCE(timezone, 'Africa/Kigali') as timezone
      FROM public.organisations
    LOOP
        v_local_date := timezone(v_org.timezone, now())::date;
        UPDATE public.invoices
        SET status = 'OVERDUE'
        WHERE org_id = v_org.id AND status = 'DUE'
          AND v_local_date > (due_date + (v_org.grace_period || ' days')::interval);
    END LOOP;

    FOR v_tenancy IN
        SELECT t.id, t.org_id, t.tenant_user_id, t.unit_id, t.agreed_rent, t.start_date,
               t.end_date, t.period_anchor_day, t.billing_frequency, t.invoice_lead_days,
               COALESCE((o.settings->'billing'->>'default_due_day')::int, 1) as org_default_due_day,
               COALESCE((o.settings->'billing'->>'default_invoice_lead_days')::int, 7) as org_default_invoice_lead_days,
               COALESCE(o.timezone, 'Africa/Kigali') as org_timezone
        FROM public.tenancies t JOIN public.organisations o ON t.org_id = o.id
        WHERE t.status = 'ACTIVE'
    LOOP
        v_local_date := timezone(v_tenancy.org_timezone, now())::date;
        v_anchor_day := COALESCE(v_tenancy.period_anchor_day, v_tenancy.org_default_due_day);
        v_invoice_lead_days := COALESCE(v_tenancy.invoice_lead_days, v_tenancy.org_default_invoice_lead_days, 7);
        IF v_anchor_day < 1 OR v_anchor_day > 31 THEN v_anchor_day := 1; END IF;
        IF v_invoice_lead_days < 0 OR v_invoice_lead_days > 30 THEN v_invoice_lead_days := 7; END IF;
        IF v_tenancy.billing_frequency <> 'MONTHLY' THEN CONTINUE; END IF;

        BEGIN
            v_anchor_this_month := make_date(extract(year from v_local_date)::int, extract(month from v_local_date)::int, v_anchor_day);
        EXCEPTION WHEN OTHERS THEN
            v_anchor_this_month := (date_trunc('month', v_local_date) + interval '1 month' - interval '1 day')::date;
        END;
        BEGIN
            v_anchor_next_month := make_date(extract(year from v_local_date + interval '1 month')::int, extract(month from v_local_date + interval '1 month')::int, v_anchor_day);
        EXCEPTION WHEN OTHERS THEN
            v_anchor_next_month := (date_trunc('month', v_local_date + interval '1 month') + interval '1 month' - interval '1 day')::date;
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
        IF NOT v_invoice_exists AND v_local_date >= v_tenancy.start_date THEN
            v_target_due_date := v_first_anchor;
        ELSIF v_local_date = (v_anchor_this_month - (v_invoice_lead_days || ' days')::interval)::date THEN
            v_target_due_date := v_anchor_this_month;
        ELSIF v_local_date = (v_anchor_next_month - (v_invoice_lead_days || ' days')::interval)::date THEN
            v_target_due_date := v_anchor_next_month;
        ELSE
            CONTINUE;
        END IF;

        IF v_tenancy.end_date IS NOT NULL AND v_target_due_date > v_tenancy.end_date THEN
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

CREATE OR REPLACE FUNCTION public.generate_first_invoice_for_new_tenancy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_default_due_day integer;
  v_org_timezone text;
  v_local_date date;
  v_anchor_day integer;
  v_first_anchor date;
  v_invoice_end date;
BEGIN
  SELECT
    COALESCE((settings->'billing'->>'default_due_day')::int, 1),
    COALESCE(timezone, 'Africa/Kigali')
  INTO v_org_default_due_day, v_org_timezone
  FROM public.organisations
  WHERE id = NEW.org_id;

  v_local_date := timezone(v_org_timezone, now())::date;

  IF NEW.status <> 'ACTIVE'
     OR NEW.billing_frequency <> 'MONTHLY'
     OR NEW.start_date > v_local_date THEN
    RETURN NEW;
  END IF;

  v_anchor_day := COALESCE(NEW.period_anchor_day, v_org_default_due_day, 1);
  IF v_anchor_day < 1 OR v_anchor_day > 31 THEN
    v_anchor_day := 1;
  END IF;

  BEGIN
    v_first_anchor := make_date(
      EXTRACT(YEAR FROM NEW.start_date)::int,
      EXTRACT(MONTH FROM NEW.start_date)::int,
      v_anchor_day
    );
  EXCEPTION WHEN OTHERS THEN
    v_first_anchor := (
      date_trunc('month', NEW.start_date) + interval '1 month' - interval '1 day'
    )::date;
  END;

  IF v_first_anchor < NEW.start_date THEN
    BEGIN
      v_first_anchor := make_date(
        EXTRACT(YEAR FROM NEW.start_date + interval '1 month')::int,
        EXTRACT(MONTH FROM NEW.start_date + interval '1 month')::int,
        v_anchor_day
      );
    EXCEPTION WHEN OTHERS THEN
      v_first_anchor := (
        date_trunc('month', NEW.start_date + interval '1 month') + interval '1 month' - interval '1 day'
      )::date;
    END;
  END IF;

  IF NEW.end_date IS NOT NULL AND v_first_anchor > NEW.end_date THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.invoices
    WHERE tenancy_id = NEW.id
      AND due_date = v_first_anchor
  ) THEN
    v_invoice_end := (v_first_anchor + interval '1 month' - interval '1 day')::date;

    INSERT INTO public.invoices (
      org_id, tenancy_id, tenant_user_id, unit_id, invoice_number, amount_due, amount_paid,
      due_date, billing_period_start, billing_period_end, status, generated_by
    ) VALUES (
      NEW.org_id, NEW.id, NEW.tenant_user_id, NEW.unit_id,
      public.generate_invoice_number(), NEW.agreed_rent, 0, v_first_anchor,
      v_first_anchor, v_invoice_end, 'DUE', 'SCHEDULED'
    );
  END IF;

  RETURN NEW;
END;
$$;
