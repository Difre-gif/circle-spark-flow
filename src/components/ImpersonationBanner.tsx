import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut, Building2, User } from "lucide-react";
import { useOrganisation } from "@/hooks/useSupabaseData";

export default function ImpersonationBanner() {
  const { impersonatedOrgId, impersonatedUser, stopImpersonating, isSuperAdmin } = useAuth();
  const { data: org } = useOrganisation(); // This will fetch the impersonated org because orgId is swapped in context

  if (!isSuperAdmin || (!impersonatedOrgId && !impersonatedUser)) return null;

  return (
    <div className="bg-amber-500 text-white py-2 px-4 sticky top-0 z-[100] shadow-md border-b border-amber-600 animate-in slide-in-from-top duration-300">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-full">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <span className="font-bold text-sm tracking-tight uppercase">Admin Impersonation Active</span>
            <span className="hidden md:block h-3 w-px bg-white/30" />
            <div className="flex items-center gap-3">
              {impersonatedUser && (
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                  <User size={12} />
                  Login As: <span className="underline decoration-white/50 underline-offset-2">{impersonatedUser.name}</span>
                </div>
              )}
              {org && (
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                  <Building2 size={12} />
                  Workspace: <span className="underline decoration-white/50 underline-offset-2">{org.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={stopImpersonating}
          className="bg-card text-amber-700 hover:bg-amber-50 border-none h-8 font-bold text-xs"
        >
          <LogOut size={14} className="mr-2" />
          Stop & Return to Admin
        </Button>
      </div>
    </div>
  );
}
