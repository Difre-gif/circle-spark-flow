import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '@/types';

// The interface required by components
export interface AuthState {
  user: User | null;
  session: Session | null;
  orgId: string | null;
  orgRole: string | null;
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
  
  clearAuth: () => set({
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
  }),

  fetchUserProfile: async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, email, phone')
        .eq('id', userId)
        .single();

      if (!userData) return;

      const isSuperAdmin = userData.email === 'fredricknjorogekariuki@gmail.com';

      // Fetch ALL active roles with org details to prioritize intelligently
      const { data: allRoles } = await supabase
        .from('user_organisation_roles')
        .select('org_id, role, org:organisations(id, name, subscription_status, currency_code, timezone)')
        .eq('user_id', userId)
        .eq('is_active', true);

      const roles = allRoles || [];
      let selectedRole = roles.length > 0 ? roles[0] : null;

      if (roles.length > 1) {
        // 1. Try to respect the last used org from localStorage
        const savedOrgId = localStorage.getItem('bizrent_last_org');
        if (savedOrgId) {
          const match = roles.find(r => r.org_id === savedOrgId);
          if (match) selectedRole = match;
        }

        // 2. If no saved org or it wasn't found, try to pick one that is NOT pending approval
        if (!savedOrgId || !roles.find(r => r.org_id === savedOrgId)) {
          const activeOrg = roles.find(r => {
            const status = (r.org as any)?.subscription_status;
            return status !== 'PENDING_APPROVAL';
          });
          if (activeOrg) selectedRole = activeOrg;
        }
      }

      let isPendingApproval = false;
      let orgCurrency = 'RWF';
      let orgTimezone = 'Africa/Kigali';

      if (selectedRole?.org_id) {
        const orgData = selectedRole.org as any;
        isPendingApproval = orgData?.subscription_status === 'PENDING_APPROVAL';
        if (orgData?.currency_code) orgCurrency = orgData.currency_code;
        if (orgData?.timezone) orgTimezone = orgData.timezone;

        // Save preference for next reload
        localStorage.setItem('bizrent_last_org', selectedRole.org_id);
      }

      const role: UserRole = isSuperAdmin 
        ? 'super-admin' 
        : (selectedRole?.role === 'TENANT' ? 'tenant' : 'landlord');

      const userObj: User = {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone || '',
        role,
        organisationId: selectedRole?.org_id || undefined,
      };

      const userOrgs = roles.map(r => ({
        id: (r.org as any)?.id,
        name: (r.org as any)?.name,
        role: r.role
      })).filter(o => o.id && o.name);

      set({
        user: userObj,
        orgId: selectedRole?.org_id || null,
        orgRole: selectedRole?.role || null,
        userOrgs,
        orgCurrency,
        orgTimezone,
        isSuperAdmin,
        isPendingApproval,
        isAuthenticated: !!get().session,
      });
    } catch (err) {      console.error('Error fetching user profile:', err);
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
    
    // Optionally fetch currency/timezone for the new org here, 
    // or just let hooks re-fire. We'll at least set the orgId.
    set({
      orgId: targetOrgId,
      orgRole: orgInfo.role,
    });
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
