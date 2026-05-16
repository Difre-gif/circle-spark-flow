-- Generate the first invoice immediately when a current/backdated tenancy is created.
-- The daily billing cron still handles future recurring invoices.

CREATE OR REPLACE FUNCTION public.generate_first_invoice_for_new_tenancy()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_default_due_day integer;
  v_anchor_day integer;
  v_first_anchor date;
  v_invoice_end date;
BEGIN
  -- Future tenancies should wait until they become current.
  IF NEW.status <> 'ACTIVE'
     OR NEW.billing_frequency <> 'MONTHLY'
     OR NEW.start_date > CURRENT_DATE THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE((settings->'billing'->>'default_due_day')::int, 1)
  INTO v_org_default_due_day
  FROM public.organisations
  WHERE id = NEW.org_id;

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

  -- If the tenancy ends before its first billable cycle, do not invent an out-of-range invoice.
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
      org_id,
      tenancy_id,
      tenant_user_id,
      unit_id,
      invoice_number,
      amount_due,
      amount_paid,
      due_date,
      billing_period_start,
      billing_period_end,
      status,
      generated_by
    ) VALUES (
      NEW.org_id,
      NEW.id,
      NEW.tenant_user_id,
      NEW.unit_id,
      public.generate_invoice_number(),
      NEW.agreed_rent,
      0,
      v_first_anchor,
      v_first_anchor,
      v_invoice_end,
      'DUE',
      'SCHEDULED'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_first_invoice_for_new_tenancy ON public.tenancies;

CREATE TRIGGER trg_generate_first_invoice_for_new_tenancy
AFTER INSERT ON public.tenancies
FOR EACH ROW
EXECUTE FUNCTION public.generate_first_invoice_for_new_tenancy();

-- Backfill any current active tenancies that were created after the last daily cron run
-- and still have no invoice yet.
SELECT public.process_automated_billing();
