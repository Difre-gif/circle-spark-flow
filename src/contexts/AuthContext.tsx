import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession, fetchUserProfile, setIsLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setTimeout(() => fetchUserProfile(session.user.id), 0);
      } else {
        clearAuth();
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, fetchUserProfile, setIsLoading, clearAuth]);

  return <>{children}</>;
}

/**
 * Transparent bridge exporting the Zustand store under the same functional hook name as before
 * meaning we don't have to break 20+ file imports across the app.
 */
export function useAuth() {
  const store = useAuthStore();

  return {
    ...store,
    user: store.impersonatedUser || store.user,
    orgId: store.impersonatedUser?.organisationId || store.impersonatedOrgId || store.orgId,
    orgRole: store.impersonatedUser 
      ? (store.impersonatedUser.role === 'tenant' ? 'TENANT' : 'OWNER') 
      : (store.impersonatedOrgId ? 'OWNER' : store.orgRole)
  };
}
