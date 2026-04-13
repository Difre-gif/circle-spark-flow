import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, requireSuperAdmin }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isSuperAdmin, orgRole, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Hard-lock: super admin routes require isSuperAdmin
  const onSuperAdminRoute = location.pathname.startsWith('/super-admin');
  if (onSuperAdminRoute || requireSuperAdmin) {
    if (!isSuperAdmin) {
      return <Navigate to="/login?error=unauthorized" replace />;
    }
    return <>{children}</>;
  }

  // Super admins can access landlord routes (for context switching / impersonation)
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (allowedRoles && orgRole && !allowedRoles.includes(orgRole)) {
    const redirectTo = user?.role === 'tenant' ? '/tenant' : '/landlord';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
