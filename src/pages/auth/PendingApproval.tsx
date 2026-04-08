import { Button } from "@/components/ui/button";
import { BizRentLogo } from "@/components/BizRentLogo";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Mail } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const { logout, user, isAuthenticated, isPendingApproval } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isPendingApproval) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-amber-500 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <BizRentLogo size="lg" className="text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Registration Received</CardTitle>
            <CardDescription className="text-slate-600">
              Your account for <span className="font-semibold text-slate-900">{user?.organisationId ? 'your organization' : 'BizRent'}</span> is pending approval.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center py-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-pulse">
              <Clock size={40} />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-slate-700">
              For security and platform integrity, our team manually reviews all new landlord applications.
            </p>
            <p className="text-sm text-slate-500 italic">
              Verification typically takes less than 24 hours.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-left border border-blue-100">
            <Mail className="text-blue-600 mt-1 flex-shrink-0" size={18} />
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Need it faster?</p>
              <p className="text-blue-700">Email us at <a href="mailto:fredricknjorogekariuki@gmail.com" className="underline font-medium">fredricknjorogekariuki@gmail.com</a> to expedite your request.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button variant="outline" className="w-full text-slate-600" onClick={handleLogout}>
            Sign out and check later
          </Button>
          <p className="text-xs text-center text-slate-400">
            BizRent — Rwanda's MoMo-First Property Management Platform
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
