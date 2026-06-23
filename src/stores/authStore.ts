import { create } from 'zustand';
import { supabase, setSupabaseOrgId } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '@/types';

const ACTIVE_ORG_ID_KEY = 'bizrent.activeOrgId';
const ACTIVE_ORG_ROLE_KEY = 'bizrent.activeOrgRole';

const readStoredActiveContext = () => {
  if (typeof window === 'undefined') return { orgId: null, orgRole: null };
  return {
    orgId: window.localStorage.getItem(ACTIVE_ORG_ID_KEY),
    orgRole: window.localStorage.getItem(ACTIVE_ORG_ROLE_KEY),
  };
};

const storeActiveContext = (orgId: string | null, orgRole: string | null) => {
  if (typeof window === 'undefined') return;
  if (orgId) window.localStorage.setItem(ACTIVE_ORG_ID_KEY, orgId);
  else window.localStorage.removeItem(ACTIVE_ORG_ID_KEY);
  if (orgRole) window.localStorage.setItem(ACTIVE_ORG_ROLE_KEY, orgRole);
  else window.localStorage.removeItem(ACTIVE_ORG_ROLE_KEY);
};

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
  impersonatedOrgId: string | null;
  impersonatedUser: User | null;
  
  // Actions matching AuthContext
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  switchOrg: (orgId: string, role?: string) => void;
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
      impersonatedOrgId: null,
      impersonatedUser: null,
    });
    storeActiveContext(null, null);
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

      const storedContext = readStoredActiveContext();

      // Determine active context by org + role. This supports a user being both
      // a landlord/staff member and a tenant in the same organization.
      let currentOrgId = get().orgId || storedContext.orgId;
      let currentOrgRole = get().orgRole || storedContext.orgRole;
      let activeRoleData = userOrgs.find(o => o.id === currentOrgId && o.role === currentOrgRole);
      if (!activeRoleData && currentOrgId) {
        activeRoleData = userOrgs.find(o => o.id === currentOrgId);
      }
      
      if (!activeRoleData && userOrgs.length > 0) {
        activeRoleData = userOrgs[0];
        currentOrgId = activeRoleData.id;
        currentOrgRole = activeRoleData.role;
      }

      // Inject the context into the Supabase client so subsequent queries respect the selected org RLS
      setSupabaseOrgId(currentOrgId || null);

      let orgCurrency = 'RWF';
      let orgTimezone = 'Africa/Kigali';

      if (currentOrgId) {
        const { data: orgData } = await supabase
          .from('organisations')
          .select('currency_code, timezone')
          .eq('id', currentOrgId)
          .single();
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
        isAuthenticated: !!get().session,
      });
      storeActiveContext(currentOrgId || null, activeRole);
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

  switchOrg: async (targetOrgId, targetRole) => {
    const orgInfo = get().userOrgs.find(o => o.id === targetOrgId && (!targetRole || o.role === targetRole));
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
    storeActiveContext(targetOrgId, orgInfo.role);
    
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
