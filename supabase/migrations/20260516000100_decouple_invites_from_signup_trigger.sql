-- Keep auth signup atomic and minimal.
-- Invitation acceptance belongs in accept_invitation(), which runs after the
-- user is authenticated. Doing invitation/tenancy side effects inside the auth
-- trigger can make the whole signup fail with "Database error saving new user".

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
BEGIN
    -- Always create the public profile row for the new auth user.
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

    -- Owner self-signup remains part of the trigger because registration
    -- intentionally creates a fresh organisation atomically.
    v_org_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'organisation_name'), '');
    IF v_org_name IS NOT NULL THEN
      v_org_slug := lower(regexp_replace(v_org_name, '[^a-zA-Z0-9]+', '-', 'g'));
      v_org_slug := trim(both '-' from v_org_slug) || '-' || trunc(extract(epoch from now()))::text;

      INSERT INTO public.organisations (name, slug, email, phone, country_code, currency_code, timezone, subscription_status)
      VALUES (
        v_org_name,
        v_org_slug,
        NEW.email,
        NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
        'RW',
        'RWF',
        'Africa/Kigali',
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

    -- Pending invitations are deliberately NOT accepted here.
    -- The frontend calls public.accept_invitation() after auth succeeds.
    RETURN NEW;
END;
$function$;
