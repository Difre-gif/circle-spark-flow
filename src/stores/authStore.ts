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

      // Use maybeSingle to prevent PGRST116 when no role exists yet (e.g. fresh user)
      const { data: roleData } = await supabase
        .from('user_organisation_roles')
        .select('org_id, role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      let isPendingApproval = false;
      if (roleData?.org_id) {
        const { data: orgData } = await supabase
          .from('organisations')
          .select('subscription_status')
          .eq('id', roleData.org_id)
          .single();
        isPendingApproval = orgData?.subscription_status === 'PENDING_APPROVAL';
      }

      const role: UserRole = isSuperAdmin 
        ? 'super-admin' 
        : (roleData?.role === 'TENANT' ? 'tenant' : 'landlord');

      const userObj: User = {
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone || '',
        role,
        organisationId: roleData?.org_id || undefined,
      };

      set({
        user: userObj,
        orgId: roleData?.org_id || null,
        orgRole: roleData?.role || null,
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
