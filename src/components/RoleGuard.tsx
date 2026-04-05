import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type AllowedRole = 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'TENANT';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AllowedRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { orgRole, isSuperAdmin } = useAuth();
  
  // Super Admins override role limitations in the UI
  if (isSuperAdmin) return <>{children}</>;
  
  // Without a role context, elements should be hidden
  if (!orgRole) return <>{fallback}</>;
  
  // Conditionally render if they match the allowed matrix
  if (allowedRoles.includes(orgRole as AllowedRole)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
