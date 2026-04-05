import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionLimits {
  maxUnits: number;
  maxProperties: number;
  maxManagers: number;
  currentUnits: number;
  currentProperties: number;
  currentManagers: number;
  canAddUnit: boolean;
  canAddProperty: boolean;
  canAddManager: boolean;
  tier: string;
  hasWhatsapp: boolean;
  hasKinyarwanda: boolean;
  hasApiAccess: boolean;
}

export function useSubscriptionLimits() {
  const { orgId } = useAuth();
  return useQuery({
    queryKey: ['subscription-limits', orgId],
    queryFn: async (): Promise<SubscriptionLimits> => {
      // Get subscription with tier details
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier, tier_details:subscription_tiers!inner(max_units, max_properties, max_managers, has_whatsapp, has_kinyarwanda, has_api_access)')
        .eq('org_id', orgId!)
        .maybeSingle();

      const tierDetails = sub?.tier_details as any;
      const maxUnits = tierDetails?.max_units ?? 15;
      const maxProperties = tierDetails?.max_properties ?? 3;
      const maxManagers = tierDetails?.max_managers ?? 1;

      // Get current counts
      const [unitsRes, propsRes, managersRes] = await Promise.all([
        supabase.from('units').select('id', { count: 'exact', head: true }).eq('org_id', orgId!).eq('is_active', true),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('org_id', orgId!).eq('is_active', true),
        supabase.from('user_organisation_roles').select('id', { count: 'exact', head: true }).eq('org_id', orgId!).eq('role', 'MANAGER' as any).eq('is_active', true),
      ]);

      const currentUnits = unitsRes.count ?? 0;
      const currentProperties = propsRes.count ?? 0;
      const currentManagers = managersRes.count ?? 0;

      return {
        maxUnits,
        maxProperties,
        maxManagers,
        currentUnits,
        currentProperties,
        currentManagers,
        canAddUnit: maxUnits === -1 || currentUnits < maxUnits,
        canAddProperty: maxProperties === -1 || currentProperties < maxProperties,
        canAddManager: maxManagers === -1 || currentManagers < maxManagers,
        tier: sub?.tier ?? 'STARTER',
        hasWhatsapp: tierDetails?.has_whatsapp ?? false,
        hasKinyarwanda: tierDetails?.has_kinyarwanda ?? false,
        hasApiAccess: tierDetails?.has_api_access ?? false,
      };
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}
