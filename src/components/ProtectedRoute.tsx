import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isSuperAdmin, isPendingApproval, orgRole, user } = useAuth();

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

  // Super Admin bypasses standard role checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // New signups must be approved unless they are the Super Admin
  if (isPendingApproval) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && orgRole && !allowedRoles.includes(orgRole)) {
    const redirectTo = user?.role === 'tenant' ? '/tenant' : '/landlord';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
