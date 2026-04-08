import { create } from 'zustand';
import { supabase, setSupabaseOrgId } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '@/types';

// The interface required by components
export interface AuthState {
  user: User | null;
  session: Session | null;
  orgId: string | null;
  orgRole: string | null;
  userOrgs: any[];
  orgCurrency: string;
  orgTimezone: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isPendingApproval: boolean;
  impersonatedOrgId: string | null;
  impersonatedUser: User | null;
  
  // Actions matching AuthContext
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  switchOrg: (orgId: string) => void;
  impersonate: (orgId: string) => void;
  impersonateUser: (targetUser: User) => void;
  stopImpersonating: () => void;

  // Internal/System Actions for the global initializer
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchUserProfile: (userId: string) => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  orgId: null,
  orgRole: null,
  userOrgs: [],
  orgCurrency: 'RWF',
  orgTimezone: 'Africa/Kigali',
  isAuthenticated: false,
  isLoading: true,
  isSuperAdmin: false,
  isPendingApproval: false,
  impersonatedOrgId: null,
  impersonatedUser: null,

  setSession: (session) => set({ session, isAuthenticated: !!session && !!get().user }),
  setUser: (user) => set({ user, isAuthenticated: !!get().session && !!user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  clearAuth: () => {
    setSupabaseOrgId(null);
    set({
      user: null,
      session: null,
      orgId: null,
      orgRole: null,
      userOrgs: [],
      orgCurrency: 'RWF',
      orgTimezone: 'Africa/Kigali',
      isAuthenticated: false,
      isSuperAdmin: false,
      isPendingApproval: false,
      impersonatedOrgId: null,
      impersonatedUser: null,
    });
  },

  fetchUserProfile: async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, email, phone')
        .eq('id', userId)
        .single();
        
      if (!userData) return;

      const isSuperAdmin = userData.email === 'fredricknjorogekariuki@gmail.com';

      // Fetch all active roles for the user to support multiple orgs/roles
      const { data: allRoles } = await supabase
        .from('user_organisation_roles')
        .select('org_id, role, org:organisations(id, name)')
        .eq('user_id', userId)
        .eq('is_active', true);

      const userOrgs = (allRoles || []).map(r => ({
        id: (r.org as any)?.id,
        name: (r.org as any)?.name,
        role: r.role
      })).filter(o => o.id && o.name);

      // Determine the active org: use currently selected orgId if valid, otherwise fallback to the first active org
      let currentOrgId = get().orgId;
      let activeRoleData = userOrgs.find(o => o.id === currentOrgId);
      
      if (!activeRoleData && userOrgs.length > 0) {
        activeRoleData = userOrgs[0];
        currentOrgId = activeRoleData.id;
      }

      // Inject the context into the Supabase client so subsequent queries respect the selected org RLS
      setSupabaseOrgId(currentOrgId || null);

      let isPendingApproval = false;
      let orgCurrency = 'RWF';
      let orgTimezone = 'Africa/Kigali';

      if (currentOrgId) {
        const { data: orgData } = await supabase
          .from('organisations')
          .select('subscription_status, currency_code, timezone')
          .eq('id', currentOrgId)
          .single();
        isPendingApproval = orgData?.subscription_status === ('PENDING_APPROVAL' as any);
        if (orgData?.currency_code) orgCurrency = orgData.currency_code;
        if (orgData?.timezone) orgTimezone = orgData.timezone;
      }

      // Role is derived from the *active* organization context, NOT overridden by isSuperAdmin
      const activeRole = activeRoleData?.role || null;
      const parsedRole: UserRole = activeRole === 'TENANT' ? 'tenant' : 'landlord';

      const userObj: User = {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone || '',
        role: parsedRole,
        organisationId: currentOrgId || undefined,
      };

      set({
        user: userObj,
        orgId: currentOrgId || null,
        orgRole: activeRole,
        userOrgs,
        orgCurrency,
        orgTimezone,
        isSuperAdmin,
        isPendingApproval,
        isAuthenticated: !!get().session,
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  },

  logout: async () => {
    await supabase.auth.signOut();
    get().clearAuth();
  },

  switchRole: () => {
    // No-op for now based on previous context 
  },

  switchOrg: async (targetOrgId) => {
    const orgInfo = get().userOrgs.find(o => o.id === targetOrgId);
    if (!orgInfo) return;
    
    // Inject new context into the Supabase client
    setSupabaseOrgId(targetOrgId);
    
    // Update the local state & user object so the router responds correctly
    set(state => {
      const parsedRole = orgInfo.role === 'TENANT' ? 'tenant' : 'landlord';
      return {
        orgId: targetOrgId,
        orgRole: orgInfo.role,
        user: state.user ? { ...state.user, role: parsedRole, organisationId: targetOrgId } : null,
      };
    });
    
    // We optionally fetch the profile again to get fresh orgCurrency/timezone
    await get().fetchUserProfile(get().user!.id);
  },

  impersonate: (orgId) => {
    if (get().isSuperAdmin) set({ impersonatedOrgId: orgId });
  },

  impersonateUser: (targetUser) => {
    if (get().isSuperAdmin) set({ impersonatedUser: targetUser });
  },

  stopImpersonating: () => {
    set({ impersonatedOrgId: null, impersonatedUser: null });
  }
}));
