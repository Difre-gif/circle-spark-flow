-- ============================================================
-- Fix RLS recursion on user_organisation_roles
-- 2026-05-17
-- ============================================================
-- Problem: Enabling RLS on user_organisation_roles created a recursive chain:
--   users (RLS) → users_org_read queries user_organisation_roles (now has RLS)
--   → uor_org_read queries user_organisation_roles again → 500 error
--
-- Fix: SECURITY DEFINER helpers bypass RLS on user_organisation_roles,
--   breaking the chain while preserving all access control guarantees.
-- ============================================================

-- ── Helpers (run as postgres, bypass RLS on user_organisation_roles) ───────
CREATE OR REPLACE FUNCTION private.my_org_ids()
  RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO 'public', 'private' AS $$
  SELECT org_id FROM public.user_organisation_roles
  WHERE user_id = auth.uid() AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION private.my_managed_org_ids()
  RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO 'public', 'private' AS $$
  SELECT org_id FROM public.user_organisation_roles
  WHERE user_id = auth.uid() AND is_active = true
    AND role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum);
$$;

CREATE OR REPLACE FUNCTION private.my_privileged_org_ids()
  RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO 'public', 'private' AS $$
  SELECT org_id FROM public.user_organisation_roles
  WHERE user_id = auth.uid() AND is_active = true
    AND role IN ('OWNER'::user_role_enum, 'MANAGER'::user_role_enum, 'ACCOUNTANT'::user_role_enum);
$$;

-- ── user_organisation_roles: rewrite self-referential policies ─────────────
DROP POLICY IF EXISTS "uor_org_read" ON public.user_organisation_roles;
DROP POLICY IF EXISTS "uor_insert"   ON public.user_organisation_roles;
DROP POLICY IF EXISTS "uor_update"   ON public.user_organisation_roles;
DROP POLICY IF EXISTS "uor_delete"   ON public.user_organisation_roles;

CREATE POLICY "uor_org_read_v2" ON public.user_organisation_roles
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));

CREATE POLICY "uor_insert_v2" ON public.user_organisation_roles
  FOR INSERT WITH CHECK (
    org_id IN (SELECT private.my_managed_org_ids()) OR user_id = auth.uid()
  );

CREATE POLICY "uor_update_v2" ON public.user_organisation_roles
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));

CREATE POLICY "uor_delete_v2" ON public.user_organisation_roles
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- ── users: rewrite org_read to use helper ──────────────────────────────────
DROP POLICY IF EXISTS "users_org_read" ON public.users;

CREATE POLICY "users_org_read_v2" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT uor.user_id FROM public.user_organisation_roles uor
      WHERE uor.org_id IN (SELECT private.my_org_ids())
    )
  );

-- ── Rewrite all other policies that inline-query user_organisation_roles ────

-- audit_logs
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select_v2" ON public.audit_logs
  FOR SELECT USING (org_id IN (SELECT private.my_privileged_org_ids()));
CREATE POLICY "audit_logs_insert_v2" ON public.audit_logs
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_org_ids()));

-- file_attachments
DROP POLICY IF EXISTS "file_attachments_select" ON public.file_attachments;
CREATE POLICY "file_attachments_select_v2" ON public.file_attachments
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));

-- notifications
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select_v2" ON public.notifications
  FOR SELECT USING (
    recipient_user_id = auth.uid() OR org_id IN (SELECT private.my_managed_org_ids())
  );
CREATE POLICY "notifications_insert_v2" ON public.notifications
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_org_ids()));

-- invoices
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;
CREATE POLICY "invoices_select_v2" ON public.invoices
  FOR SELECT USING (org_id IN (SELECT private.my_privileged_org_ids()) OR tenant_user_id = auth.uid());
CREATE POLICY "invoices_insert_v2" ON public.invoices
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "invoices_update_v2" ON public.invoices
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "invoices_delete_v2" ON public.invoices
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- payments
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_update" ON public.payments;
CREATE POLICY "payments_select_v2" ON public.payments
  FOR SELECT USING (org_id IN (SELECT private.my_privileged_org_ids()) OR tenant_user_id = auth.uid());
CREATE POLICY "payments_update_v2" ON public.payments
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- properties
DROP POLICY IF EXISTS "properties_select" ON public.properties;
DROP POLICY IF EXISTS "properties_insert" ON public.properties;
DROP POLICY IF EXISTS "properties_update" ON public.properties;
DROP POLICY IF EXISTS "properties_delete" ON public.properties;
CREATE POLICY "properties_select_v2" ON public.properties
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));
CREATE POLICY "properties_insert_v2" ON public.properties
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "properties_update_v2" ON public.properties
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "properties_delete_v2" ON public.properties
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- units
DROP POLICY IF EXISTS "units_select" ON public.units;
DROP POLICY IF EXISTS "units_insert" ON public.units;
DROP POLICY IF EXISTS "units_update" ON public.units;
DROP POLICY IF EXISTS "units_delete" ON public.units;
CREATE POLICY "units_select_v2" ON public.units
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));
CREATE POLICY "units_insert_v2" ON public.units
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "units_update_v2" ON public.units
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "units_delete_v2" ON public.units
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- tenancies
DROP POLICY IF EXISTS "tenancies_select" ON public.tenancies;
DROP POLICY IF EXISTS "tenancies_insert" ON public.tenancies;
DROP POLICY IF EXISTS "tenancies_update" ON public.tenancies;
DROP POLICY IF EXISTS "tenancies_delete" ON public.tenancies;
CREATE POLICY "tenancies_select_v2" ON public.tenancies
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));
CREATE POLICY "tenancies_insert_v2" ON public.tenancies
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "tenancies_update_v2" ON public.tenancies
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "tenancies_delete_v2" ON public.tenancies
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- receipts
DROP POLICY IF EXISTS "receipts_select" ON public.receipts;
DROP POLICY IF EXISTS "receipts_insert" ON public.receipts;
CREATE POLICY "receipts_select_v2" ON public.receipts
  FOR SELECT USING (org_id IN (SELECT private.my_privileged_org_ids()) OR tenant_user_id = auth.uid());
CREATE POLICY "receipts_insert_v2" ON public.receipts
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));

-- subscriptions
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON public.subscriptions;
CREATE POLICY "subscriptions_select_v2" ON public.subscriptions
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));
CREATE POLICY "subscriptions_update_v2" ON public.subscriptions
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- organisations
DROP POLICY IF EXISTS "organisations_select" ON public.organisations;
DROP POLICY IF EXISTS "organisations_update" ON public.organisations;
CREATE POLICY "organisations_select_v2" ON public.organisations
  FOR SELECT USING (id IN (SELECT private.my_org_ids()));
CREATE POLICY "organisations_update_v2" ON public.organisations
  FOR UPDATE USING (id IN (SELECT private.my_managed_org_ids()));

-- property_manager_assignments
DROP POLICY IF EXISTS "pma_select" ON public.property_manager_assignments;
DROP POLICY IF EXISTS "pma_insert" ON public.property_manager_assignments;
DROP POLICY IF EXISTS "pma_delete" ON public.property_manager_assignments;
CREATE POLICY "pma_select_v2" ON public.property_manager_assignments
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));
CREATE POLICY "pma_insert_v2" ON public.property_manager_assignments
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "pma_delete_v2" ON public.property_manager_assignments
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- webhook_subscriptions
DROP POLICY IF EXISTS "webhook_select" ON public.webhook_subscriptions;
DROP POLICY IF EXISTS "webhook_insert" ON public.webhook_subscriptions;
DROP POLICY IF EXISTS "webhook_delete" ON public.webhook_subscriptions;
CREATE POLICY "webhook_select_v2" ON public.webhook_subscriptions
  FOR SELECT USING (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "webhook_insert_v2" ON public.webhook_subscriptions
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "webhook_delete_v2" ON public.webhook_subscriptions
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- failed_notification_jobs
DROP POLICY IF EXISTS "fnj_org_read" ON public.failed_notification_jobs;
CREATE POLICY "fnj_org_read_v2" ON public.failed_notification_jobs
  FOR SELECT USING (org_id IN (SELECT private.my_managed_org_ids()));

-- webhook_dead_letters
DROP POLICY IF EXISTS "wdl_org_read" ON public.webhook_dead_letters;
CREATE POLICY "wdl_org_read_v2" ON public.webhook_dead_letters
  FOR SELECT USING (org_id IN (SELECT private.my_managed_org_ids()));

-- invitations
DROP POLICY IF EXISTS "invitations_select_v2" ON public.invitations;
DROP POLICY IF EXISTS "invitations_insert_v2" ON public.invitations;
DROP POLICY IF EXISTS "invitations_delete_v2" ON public.invitations;
CREATE POLICY "invitations_select_v3" ON public.invitations
  FOR SELECT USING (org_id IN (SELECT private.my_org_ids()));
CREATE POLICY "invitations_insert_v3" ON public.invitations
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "invitations_delete_v3" ON public.invitations
  FOR DELETE USING (org_id IN (SELECT private.my_managed_org_ids()));

-- tenant_credits
DROP POLICY IF EXISTS "tenant_credits_read"   ON public.tenant_credits;
DROP POLICY IF EXISTS "tenant_credits_write"  ON public.tenant_credits;
DROP POLICY IF EXISTS "tenant_credits_update" ON public.tenant_credits;
CREATE POLICY "tenant_credits_read_v2" ON public.tenant_credits
  FOR SELECT USING (org_id IN (SELECT private.my_privileged_org_ids()));
CREATE POLICY "tenant_credits_write_v2" ON public.tenant_credits
  FOR INSERT WITH CHECK (org_id IN (SELECT private.my_managed_org_ids()));
CREATE POLICY "tenant_credits_update_v2" ON public.tenant_credits
  FOR UPDATE USING (org_id IN (SELECT private.my_managed_org_ids()));
