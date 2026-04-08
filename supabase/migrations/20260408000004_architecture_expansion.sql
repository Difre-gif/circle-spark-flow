-- Migration: Comprehensive Architecture Expansion
-- Implements Control Scope, Tenancy Lifecycle, Property Config, and Credits

-- 1. Enums
DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'MIXED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE unit_type_enum AS ENUM ('ROOM', 'APARTMENT', 'SHOP', 'OFFICE', 'LAND');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE billing_frequency_enum AS ENUM ('WEEKLY', 'MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE lease_type_enum AS ENUM ('FIXED', 'ROLLING');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Properties Update
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS property_type property_type_enum NOT NULL DEFAULT 'RESIDENTIAL',
  ADD COLUMN IF NOT EXISTS momo_receive_number varchar(20);

-- 3. Property Managers (Staff Assignment)
CREATE TABLE IF NOT EXISTS public.property_managers (
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (property_id, user_id)
);

-- 4. Units Update
ALTER TABLE public.units 
  ADD COLUMN IF NOT EXISTS unit_type unit_type_enum NOT NULL DEFAULT 'APARTMENT',
  ADD COLUMN IF NOT EXISTS utilities_policy jsonb NOT NULL DEFAULT '{"water": "TENANT", "electricity": "TENANT"}'::jsonb,
  ADD COLUMN IF NOT EXISTS amenities jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 5. Tenancies Update
ALTER TABLE public.tenancies 
  ADD COLUMN IF NOT EXISTS billing_frequency billing_frequency_enum NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS period_anchor_day integer NOT NULL DEFAULT 1 CHECK (period_anchor_day BETWEEN 1 AND 31),
  ADD COLUMN IF NOT EXISTS lease_type lease_type_enum NOT NULL DEFAULT 'ROLLING',
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS notice_period_days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS advance_payment_months integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS security_deposit_total numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS security_deposit_refundable numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rent_escalation_clause jsonb;

-- 6. Tenant Credits Ledger
CREATE TABLE IF NOT EXISTS public.tenant_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  tenant_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  reason text NOT NULL,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Lease Terminations
CREATE TABLE IF NOT EXISTS public.lease_terminations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE UNIQUE,
  notice_given_date date NOT NULL DEFAULT current_date,
  planned_move_out_date date NOT NULL,
  actual_move_out_date date,
  checklist jsonb NOT NULL DEFAULT '{}'::jsonb,
  deductions numeric(12,2) NOT NULL DEFAULT 0,
  refund_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'DISPUTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Enable RLS
ALTER TABLE public.property_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lease_terminations ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Property Managers RLS: Inherit from properties
CREATE POLICY "uor_property_managers_access" ON public.property_managers
  FOR ALL TO authenticated
  USING (
    property_id IN (SELECT id FROM public.properties)
  );

-- Tenant Credits RLS: Inherit from org
CREATE POLICY "uor_tenant_credits_access" ON public.tenant_credits
  FOR ALL TO authenticated
  USING (
    org_id = current_setting('app.current_org_id', true)::uuid
  );

-- Lease Terminations RLS: Inherit from tenancies
CREATE POLICY "uor_lease_terminations_access" ON public.lease_terminations
  FOR ALL TO authenticated
  USING (
    tenancy_id IN (SELECT id FROM public.tenancies)
  );
