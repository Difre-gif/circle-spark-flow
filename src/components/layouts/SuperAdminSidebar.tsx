import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  History,
  Radio,
  SlidersHorizontal,
  Ghost,
  DollarSign,
  Activity,
  ShieldAlert,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { BizRentLogo } from "@/components/BizRentLogo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavGroup = {
  label: string;
  items: { icon: React.ElementType; label: string; href: string }[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Overview", href: "/super-admin" },
      { icon: Building2, label: "Organizations", href: "/super-admin/organizations" },
      { icon: Users, label: "Platform Users", href: "/super-admin/users" },
    ],
  },
  {
    label: "Sovereignty Tools",
    items: [
      { icon: Ghost, label: "Ghost Engine", href: "/super-admin/ghost" },
      { icon: DollarSign, label: "Financial Override", href: "/super-admin/financial" },
      { icon: Activity, label: "System Vitals", href: "/super-admin/vitals" },
      { icon: ShieldAlert, label: "Fraud & Forensics", href: "/super-admin/fraud" },
      { icon: Home, label: "Property Control", href: "/super-admin/property-control" },
    ],
  },
  {
    label: "System",
    items: [
      { icon: History, label: "Audit Logs", href: "/super-admin/audit" },
      { icon: Radio, label: "Job Monitor", href: "/super-admin/monitor" },
      { icon: SlidersHorizontal, label: "Global Config", href: "/super-admin/config" },
      { icon: Settings, label: "Config & Tiers", href: "/super-admin/settings" },
    ],
  },
];

export function SuperAdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 lg:hidden text-slate-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-800 shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="p-6">
            <Link to="/super-admin" className="flex items-center gap-3">
              <BizRentLogo className="text-emerald-400 h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white">BizRent</span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Super Admin</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 mt-1 space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                        )}
                      >
                        <item.icon size={18} className={cn("transition-colors", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer User Profile */}
          <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 px-2 py-3">
              <Avatar className="h-9 w-9 border border-slate-700 ring-2 ring-emerald-500/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                <AvatarFallback className="bg-slate-800 text-slate-300">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold text-white">{user?.name}</span>
                <span className="truncate text-xs text-slate-500">{user?.email}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="mt-4 w-full justify-start gap-3 border-slate-800 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
