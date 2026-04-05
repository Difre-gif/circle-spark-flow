
-- 1. Create register_organisation() SECURITY DEFINER function
-- This allows new users to atomically create their org + role + subscription during signup
CREATE OR REPLACE FUNCTION public.register_organisation(
  p_name TEXT,
  p_slug TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check user doesn't already have an org
  IF EXISTS (SELECT 1 FROM user_organisation_roles WHERE user_id = v_user_id AND is_active = true) THEN
    RAISE EXCEPTION 'User already belongs to an organisation';
  END IF;

  -- Create organisation
  INSERT INTO organisations (name, slug, email, phone, country_code, currency_code, timezone, subscription_status)
  VALUES (p_name, p_slug, p_email, p_phone, 'RW', 'RWF', 'Africa/Kigali', 'TRIAL')
  RETURNING id INTO v_org_id;

  -- Assign OWNER role
  INSERT INTO user_organisation_roles (user_id, org_id, role, is_active, accepted_at)
  VALUES (v_user_id, v_org_id, 'OWNER', true, NOW());

  -- Create trial subscription
  INSERT INTO subscriptions (org_id, tier, billing_cycle, amount, status, trial_ends_at)
  VALUES (v_org_id, 'STARTER', 'MONTHLY', 0, 'TRIAL', NOW() + INTERVAL '30 days');

  -- Set trial_ends_at on org too
  UPDATE organisations SET trial_ends_at = NOW() + INTERVAL '30 days' WHERE id = v_org_id;

  RETURN v_org_id;
END;
$$;

-- 2. Add audit_logs INSERT policy for authenticated users
CREATE POLICY "audit_logs_insert"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM user_organisation_roles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- 3. Add audit_logs SELECT policy for OWNER/ACCOUNTANT
CREATE POLICY "audit_logs_select"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM user_organisation_roles
      WHERE user_id = auth.uid() AND is_active = true
      AND role IN ('OWNER', 'ACCOUNTANT', 'MANAGER')
    )
  );

-- 4. Add SELECT policy for subscription_tiers (public read for all authenticated)
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_tiers_select"
  ON public.subscription_tiers
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Add users org_read policy so landlords can see tenant names
CREATE POLICY "users_org_read"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT uor.user_id FROM user_organisation_roles uor
      WHERE uor.org_id IN (
        SELECT org_id FROM user_organisation_roles
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- 6. Add uor_org_read so owners/managers can see all roles in their org
CREATE POLICY "uor_org_read"
  ON public.user_organisation_roles
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM user_organisation_roles uor2
      WHERE uor2.user_id = auth.uid() AND uor2.is_active = true
      AND uor2.role IN ('OWNER', 'MANAGER', 'ACCOUNTANT')
    )
  );
