import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Layouts
import { LandlordLayout } from "@/components/layouts/LandlordLayout";
import { TenantLayout } from "@/components/layouts/TenantLayout";

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

// Tenant pages
import TenantDashboard from "@/pages/tenant/Dashboard";
import TenantInvoices from "@/pages/tenant/TenantInvoices";
import TenantInvoiceDetail from "@/pages/tenant/TenantInvoiceDetail";
import TenantReceipts from "@/pages/tenant/TenantReceipts";
import TenantPaymentHistory from "@/pages/tenant/TenantPaymentHistory";
import TenantProfile from "@/pages/tenant/TenantProfile";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

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
          ? <Navigate to={user?.role === 'tenant' ? '/tenant' : '/landlord'} replace />
          : <Navigate to="/login" replace />
      } />

      {/* Landlord portal */}
      <Route path="/landlord" element={isAuthenticated ? <LandlordLayout /> : <Navigate to="/login" replace />}>
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
      <Route path="/tenant" element={isAuthenticated ? <TenantLayout /> : <Navigate to="/login" replace />}>
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
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
