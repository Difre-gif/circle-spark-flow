-- Add bypass RLS for super admin email
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (auth.jwt() ->> 'email') = 'fredricknjorogekariuki@gmail.com';
$$;

-- Global access to users table for Super Admin
CREATE POLICY "superadmin_bypass_users" ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Global access to audit_logs table for Super Admin
CREATE POLICY "superadmin_bypass_audit" ON public.audit_logs
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Global access to organisations table for Super Admin
CREATE POLICY "superadmin_bypass_orgs" ON public.organisations
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Global access to user_organisation_roles
CREATE POLICY "superadmin_bypass_roles" ON public.user_organisation_roles
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Global access to properties
CREATE POLICY "superadmin_bypass_properties" ON public.properties
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Global access to units
CREATE POLICY "superadmin_bypass_units" ON public.units
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Global access to payments
CREATE POLICY "superadmin_bypass_payments" ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Global access to invoices
CREATE POLICY "superadmin_bypass_invoices" ON public.invoices
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
