-- Migration: Manager Isolation Policy for Properties
-- Modifies the RLS policy on the properties table so that a MANAGER 
-- can only see properties they have been explicitly assigned to.

CREATE OR REPLACE FUNCTION public.is_property_manager(p_property_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.property_managers
    WHERE property_id = p_property_id
    AND user_id = (current_setting('app.current_user_id', true))::uuid
  );
$$;

-- Drop the old overly-permissive policy
DROP POLICY IF EXISTS "uor_properties_access" ON public.properties;

-- Create the new smart policy
CREATE POLICY "uor_properties_access" ON public.properties
FOR ALL TO authenticated
USING (
    org_id = current_setting('app.current_org_id', true)::uuid
    AND (
        current_setting('app.user_role', true) IN ('OWNER', 'SUPER_ADMIN', 'ACCOUNTANT')
        OR
        (current_setting('app.user_role', true) = 'MANAGER' AND public.is_property_manager(id))
    )
);
