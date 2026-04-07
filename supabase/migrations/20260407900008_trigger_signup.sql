CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_invitation_record RECORD;
    v_org_name TEXT;
    v_org_slug TEXT;
    v_org_id uuid;
BEGIN
    -- First, create the public.users record
    INSERT INTO public.users (
      id, email, full_name, phone, password_hash, is_active, is_email_verified, preferred_language, created_at, updated_at
    )
    VALUES (
      NEW.id, NEW.email,
      COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), SPLIT_PART(NEW.email, '@', 1)),
      NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
      '', TRUE, (NEW.email_confirmed_at IS NOT NULL), 'en', NOW(), NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Second, check if the user provided an organisation name during sign up
    v_org_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'organisation_name'), '');
    IF v_org_name IS NOT NULL THEN
      v_org_slug := lower(regexp_replace(v_org_name, '[^a-zA-Z0-9]+', '-', 'g'));
      v_org_slug := trim(both '-' from v_org_slug) || '-' || trunc(extract(epoch from now()))::text;
      
      -- Create organisation
      INSERT INTO public.organisations (name, slug, email, phone, country_code, currency_code, timezone, subscription_status)
      VALUES (v_org_name, v_org_slug, NEW.email, NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''), 'RW', 'RWF', 'Africa/Kigali', 'TRIAL')
      RETURNING id INTO v_org_id;

      -- Assign OWNER role
      INSERT INTO public.user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
      VALUES (NEW.id, v_org_id, 'OWNER', true, NOW());

      -- Create trial subscription
      INSERT INTO public.subscriptions (org_id, tier, billing_cycle, amount, status, trial_ends_at)
      VALUES (v_org_id, 'STARTER', 'MONTHLY', 0, 'TRIAL', NOW() + INTERVAL '30 days');

      -- Set trial_ends_at on org too
      UPDATE public.organisations SET trial_ends_at = NOW() + INTERVAL '30 days' WHERE id = v_org_id;
    END IF;

    -- Third, check for pending invitations for this email
    FOR v_invitation_record IN 
        SELECT * FROM public.invitations WHERE email = NEW.email AND status = 'PENDING'
    LOOP
        -- Link to organisation
        INSERT INTO public.user_organisation_roles (user_id, org_id, role, is_active, invited_by, invited_at, accepted_at)
        VALUES (NEW.id, v_invitation_record.org_id, v_invitation_record.role, TRUE, v_invitation_record.invited_by, v_invitation_record.created_at, NOW())
        ON CONFLICT (user_id, org_id) DO UPDATE SET role = EXCLUDED.role, is_active = true, accepted_at = NOW();

        -- If a unit was pre-assigned, create the tenancy
        IF v_invitation_record.unit_id IS NOT NULL THEN
            -- Find the agreed rent from the unit
            DECLARE 
                v_monthly_rent numeric;
            BEGIN
                SELECT monthly_rent INTO v_monthly_rent FROM public.units WHERE id = v_invitation_record.unit_id;
                
                INSERT INTO public.tenancies (org_id, unit_id, tenant_user_id, start_date, agreed_rent, status, created_by)
                VALUES (v_invitation_record.org_id, v_invitation_record.unit_id, NEW.id, CURRENT_DATE, v_monthly_rent, 'ACTIVE', v_invitation_record.invited_by)
                ON CONFLICT DO NOTHING;
            END;
        END IF;

        -- Mark invitation as accepted
        UPDATE public.invitations SET status = 'ACCEPTED', accepted_at = NOW(), updated_at = NOW() WHERE id = v_invitation_record.id;
    END LOOP;

    RETURN NEW;
END;
$function$;