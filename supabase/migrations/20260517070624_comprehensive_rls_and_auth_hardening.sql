-- ============================================================
-- Comprehensive RLS + Auth Hardening
-- 2026-05-17
-- ============================================================
-- Problems fixed:
--  1. Several public tables had RLS disabled — policies existed but unenforced
--  2. Sensitive token/credential tables had no RLS or policies at all
--  3. Multiple RLS policies used current_setting('app.user_role') which any
--     authenticated user can bypass with SET LOCAL app.user_role = 'SUPER_ADMIN'
--  4. platform_settings policy contained a hardcoded super-admin email
--  5. Views not marked security_invoker explicitly (PG15+ best practice)
-- ============================================================

-- ── Part 1: Enable RLS on tables that have policies but RLS was OFF ────────
-- These tables already have well-formed policies; enabling RLS enforces them.
ALTER TABLE public.audit_logs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organisation_roles  ENABLE ROW LEVEL SECURITY;

-- ── Part 2: Enable RLS on sensitive tables with no protection at all ───────
ALTER TABLE public.email_verification_tokens  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_allowlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_invitations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_signals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_notification_jobs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_dead_letters       ENABLE ROW LEVEL SECURITY;

-- ── Part 3: Block all direct access to credential/token tables ─────────────
-- All legitimate access goes through SECURITY DEFINER RPCs (which run as
-- postgres and therefore bypass RLS). Direct PostgREST queries must be denied.
CREATE POLICY "evt_no_direct_access" ON public.email_verification_tokens
  AS RESTRICTIVE FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "prt_no_direct_access" ON public.password_reset_tokens
  AS RESTRICTIVE FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "rt_no_direct_access" ON public.refresh_tokens
  AS RESTRICTIVE FOR ALL TO authenticated, anon
  USING (false) WITH CHECK (false);

-- ── Part 4: Admin-only policies for privileged lookup tables ───────────────
CREATE POLICY "sal_admin_only" ON public.super_admin_allowlist
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "sai_admin_only" ON public.super_admin_invitations
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

CREATE POLICY "fs_admin_only" ON public.fraud_signals
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- ── Part 5: Org-scoped policies for operational log tables ─────────────────
-- failed_notification_jobs: owners/managers see their org's failures
CREATE POLICY "fnj_org_read" ON public.failed_notification_jobs
  FOR SELECT USING (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid()
        AND uor.is_active = true
        AND uor.role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum)
    )
  );

CREATE POLICY "fnj_admin_all" ON public.failed_notification_jobs
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- webhook_dead_letters: owners see their org's dead letters; admins see all
CREATE POLICY "wdl_org_read" ON public.webhook_dead_letters
  FOR SELECT USING (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid()
        AND uor.is_active = true
        AND uor.role = 'OWNER'::user_role_enum
    )
  );

CREATE POLICY "wdl_admin_all" ON public.webhook_dead_letters
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- ── Part 6: Remove policies that use current_setting('app.user_role') ──────
-- Any authenticated user can SET LOCAL app.user_role = 'SUPER_ADMIN' within
-- a transaction, making these checks trivially bypassable.
-- The superadmin_bypass_* policies (using private.is_super_admin()) already
-- provide correct coverage for those tables.

DROP POLICY IF EXISTS "audit_logs_super_admin_select"     ON public.audit_logs;
DROP POLICY IF EXISTS "organisations_super_admin_select"  ON public.organisations;
DROP POLICY IF EXISTS "organisations_super_admin_update"  ON public.organisations;
DROP POLICY IF EXISTS "users_super_admin_read"            ON public.users;
DROP POLICY IF EXISTS "properties_org_isolation"          ON public.properties;
DROP POLICY IF EXISTS "uor_properties_access"             ON public.properties;

-- subscription_tiers: replace current_setting policy with private.is_super_admin()
DROP POLICY IF EXISTS "subscription_tiers_super_admin_all" ON public.subscription_tiers;
CREATE POLICY "subscription_tiers_admin_all" ON public.subscription_tiers
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- tenant_credits: replace current_setting policy with auth.uid() + role check
DROP POLICY IF EXISTS "uor_tenant_credits_access" ON public.tenant_credits;

CREATE POLICY "tenant_credits_read" ON public.tenant_credits
  FOR SELECT USING (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid()
        AND uor.is_active = true
        AND uor.role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum, 'ACCOUNTANT'::user_role_enum)
    )
  );

CREATE POLICY "tenant_credits_write" ON public.tenant_credits
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid()
        AND uor.is_active = true
        AND uor.role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum)
    )
  );

CREATE POLICY "tenant_credits_update" ON public.tenant_credits
  FOR UPDATE USING (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid()
        AND uor.is_active = true
        AND uor.role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum)
    )
  );

CREATE POLICY "tenant_credits_admin" ON public.tenant_credits
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- invitations: replace current_setting policies with auth.uid() + role check
DROP POLICY IF EXISTS "invitations_select" ON public.invitations;
DROP POLICY IF EXISTS "invitations_insert" ON public.invitations;
DROP POLICY IF EXISTS "invitations_delete" ON public.invitations;

CREATE POLICY "invitations_select_v2" ON public.invitations
  FOR SELECT USING (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid() AND uor.is_active = true
    )
  );

CREATE POLICY "invitations_insert_v2" ON public.invitations
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid()
        AND uor.is_active = true
        AND uor.role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum)
    )
  );

CREATE POLICY "invitations_delete_v2" ON public.invitations
  FOR DELETE USING (
    org_id IN (
      SELECT uor.org_id FROM public.user_organisation_roles uor
      WHERE uor.user_id = auth.uid()
        AND uor.is_active = true
        AND uor.role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum)
    )
  );

-- ── Part 7: Fix hardcoded super-admin email in platform_settings ────────────
DROP POLICY IF EXISTS "Super admin full access to platform_settings" ON public.platform_settings;

CREATE POLICY "platform_settings_admin_all" ON public.platform_settings
  FOR ALL USING (private.is_super_admin())
  WITH CHECK (private.is_super_admin());

-- ── Part 8: Mark views as explicitly security_invoker (PostgreSQL 15+) ──────
-- Ensures the caller's RLS applies to all underlying tables.
-- This project runs PostgreSQL 17 so ALTER VIEW ... SET is supported.
ALTER VIEW public.invoice_collection_summary SET (security_invoker = on);
ALTER VIEW public.overdue_aging_report       SET (security_invoker = on);
ALTER VIEW public.unit_occupancy_summary     SET (security_invoker = on);
