-- Add bypass RLS for super admin to tenancies table

-- Global access to tenancies table for Super Admin
CREATE POLICY "superadmin_bypass_tenancies" ON public.tenancies
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());