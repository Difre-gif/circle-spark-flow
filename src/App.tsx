import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ImpersonationBanner from "@/components/ImpersonationBanner";

// Layouts
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { TenantLayout } from "@/components/layouts/TenantLayout";
import { SuperAdminLayout } from "@/components/layouts/SuperAdminLayout";

// Landlord pages
import LandlordDashboard from "@/pages/landlord/Dashboard";
import Properties from "@/pages/landlord/Properties";
import PropertyDetail from "@/pages/landlord/PropertyDetail";
import Units from "@/pages/landlord/Units";
import Tenants from "@/pages/landlord/Tenants";
import Tenancies from "@/pages/landlord/Tenancies";
import Invoices from "@/pages/landlord/Invoices";
import InvoiceDetail from "@/pages/landlord/InvoiceDetail";
import PendingPayments from "@/pages/landlord/PendingPayments";
import PaymentDetail from "@/pages/landlord/PaymentDetail";
import Reports from "@/pages/landlord/Reports";
import Receipts from "@/pages/landlord/Receipts";
import TeamManagement from "@/pages/landlord/TeamManagement";
import AuditLogs from "@/pages/landlord/AuditLogs";
import Settings from "@/pages/landlord/Settings";
import Notifications from "@/pages/landlord/Notifications";

// Super Admin pages
import SuperAdminDashboard from "@/pages/super-admin/Dashboard";
import SuperAdminOrganizations from "@/pages/super-admin/Organizations";
import SuperAdminUsers from "@/pages/super-admin/Users";
import SuperAdminAuditLogs from "@/pages/super-admin/AuditLogs";
import SuperAdminSettings from "@/pages/super-admin/Settings";
import SuperAdminMonitor from "@/pages/super-admin/Monitor";
import GlobalConfig from "@/pages/super-admin/GlobalConfig";
import PendingApproval from "@/pages/auth/PendingApproval";

// Tenant pages
import TenantDashboard from "@/pages/tenant/Dashboard";
import TenantInvoices from "@/pages/tenant/TenantInvoices";
import TenantInvoiceDetail from "@/pages/tenant/TenantInvoiceDetail";
import TenantReceipts from "@/pages/tenant/TenantReceipts";
import TenantPaymentHistory from "@/pages/tenant/TenantPaymentHistory";
import TenantProfile from "@/pages/tenant/TenantProfile";

import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Root redirect */}
      <Route path="/" element={
        isAuthenticated
          ? (user?.role === 'super-admin' 
              ? <Navigate to="/super-admin" replace />
              : <Navigate to={user?.role === 'tenant' ? '/tenant' : '/landlord'} replace />)
          : <Navigate to="/login" replace />
      } />

      {/* Special states */}
      <Route path="/pending-approval" element={<PendingApproval />} />

      {/* Super Admin portal */}
      <Route path="/super-admin" element={
        <ProtectedRoute>
          {/* ProtectedRoute already allows all if isSuperAdmin is true */}
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="organizations" element={<SuperAdminOrganizations />} />
        <Route path="users" element={<SuperAdminUsers />} />
        <Route path="audit" element={<SuperAdminAuditLogs />} />
        <Route path="monitor" element={<SuperAdminMonitor />} />
        <Route path="config" element={<GlobalConfig />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      {/* Landlord portal */}
      <Route path="/landlord" element={
        <ProtectedRoute allowedRoles={['OWNER', 'MANAGER', 'ACCOUNTANT']}>
          <LandlordLayout />
        </ProtectedRoute>
      }>
        <Route index element={<LandlordDashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="units" element={<Units />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="tenancies" element={<Tenancies />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="payments" element={<PendingPayments />} />
        <Route path="payments/:id" element={<PaymentDetail />} />
        <Route path="reports" element={<Reports />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="team" element={<TeamManagement />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Tenant portal */}
      <Route path="/tenant" element={
        <ProtectedRoute allowedRoles={['TENANT']}>
          <TenantLayout />
        </ProtectedRoute>
      }>
        <Route index element={<TenantDashboard />} />
        <Route path="invoices" element={<TenantInvoices />} />
        <Route path="invoices/:id" element={<TenantInvoiceDetail />} />
        <Route path="receipts" element={<TenantReceipts />} />
        <Route path="payments" element={<TenantPaymentHistory />} />
        <Route path="profile" element={<TenantProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ImpersonationBanner />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
