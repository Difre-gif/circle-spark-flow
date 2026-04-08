-- Missing Super Admin RPCs for Dashboard

CREATE OR REPLACE FUNCTION public.get_global_admin_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_mrr numeric;
    v_collection_rate numeric;
    v_active_orgs integer;
    v_pending_orgs integer;
    v_total_units integer;
    v_total_due numeric;
    v_total_paid numeric;
BEGIN
    -- Only super admin can run this
    IF current_user != 'postgres' AND (auth.jwt() ->> 'email') != 'fredricknjorogekariuki@gmail.com' THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Calculate MRR (sum of active tenancies agreed rent)
    SELECT COALESCE(SUM(agreed_rent), 0) INTO v_mrr FROM public.tenancies WHERE status = 'ACTIVE';

    -- Collection Rate for current month
    SELECT COALESCE(SUM(amount_due), 0), COALESCE(SUM(amount_paid), 0) 
    INTO v_total_due, v_total_paid 
    FROM public.invoices 
    WHERE date_trunc('month', billing_period_start) = date_trunc('month', CURRENT_DATE);

    IF v_total_due > 0 THEN
        v_collection_rate := (v_total_paid / v_total_due) * 100;
    ELSE
        v_collection_rate := 100;
    END IF;

    -- Org counts
    SELECT COUNT(*) INTO v_active_orgs FROM public.organisations WHERE is_active = true AND subscription_status != 'PENDING';
    SELECT COUNT(*) INTO v_pending_orgs FROM public.organisations WHERE subscription_status = 'PENDING';
    SELECT COUNT(*) INTO v_total_units FROM public.units;

    RETURN json_build_object(
        'mrr', v_mrr,
        'collection_rate', ROUND(v_collection_rate, 1),
        'active_orgs', v_active_orgs,
        'pending_orgs', v_pending_orgs,
        'total_units', v_total_units,
        'platform_growth_pct', 15.4 -- Mock for now
    );
END;
$$;
