import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  orgId: string | null;
  orgRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isPendingApproval: boolean;
  impersonatedOrgId: string | null;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  impersonate: (orgId: string) => void;
  stopImpersonating: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [impersonatedOrgId, setImpersonatedOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email, phone')
        .eq('id', userId)
        .single();

      if (userData.email === 'fredricknjorogekariuki@gmail.com') {
        setIsSuperAdmin(true);
      }

      const { data: roleData } = await supabase
        .from('user_organisation_roles')
        .select('org_id, role')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (roleData?.org_id) {
        const { data: orgData } = await supabase
          .from('organisations')
          .select('subscription_status')
          .eq('id', roleData.org_id)
          .single();
        
        if (orgData?.subscription_status === 'PENDING_APPROVAL') {
          setIsPendingApproval(true);
        }
      }

      const role: UserRole = userData.email === 'fredricknjorogekariuki@gmail.com' 
        ? 'super-admin' 
        : (roleData?.role === 'TENANT' ? 'tenant' : 'landlord');

      setUser({
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        phone: userData.phone || '',
        role,
        organisationId: roleData?.org_id || undefined,
      });
      setOrgId(roleData?.org_id || null);
      setOrgRole(roleData?.role || null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // Use setTimeout to avoid Supabase client deadlock
          setTimeout(() => fetchUserProfile(newSession.user.id), 0);
        } else {
          setUser(null);
          setOrgId(null);
          setOrgRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setOrgId(null);
    setOrgRole(null);
    setIsSuperAdmin(false);
    setIsPendingApproval(false);
  }, []);

  const switchRole = useCallback((_role: UserRole) => {
    // No-op in real auth — role comes from database
  }, []);

  const impersonate = useCallback((targetOrgId: string) => {
    if (!isSuperAdmin) return;
    setImpersonatedOrgId(targetOrgId);
  }, [isSuperAdmin]);

  const stopImpersonating = useCallback(() => {
    setImpersonatedOrgId(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      orgId: impersonatedOrgId || orgId,
      orgRole: impersonatedOrgId ? 'OWNER' : orgRole,
      isAuthenticated: !!session && !!user,
      isLoading,
      isSuperAdmin,
      isPendingApproval,
      impersonatedOrgId,
      login,
      logout,
      switchRole,
      impersonate,
      stopImpersonating,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
