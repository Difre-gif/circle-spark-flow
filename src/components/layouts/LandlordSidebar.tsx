import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  Shield, Settings, Home, ChevronsUpDown, LogOut, Plus, Receipt, BarChart
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { BizRentLogo } from '@/components/BizRentLogo';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganisation } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { title: 'Dashboard', url: '/landlord', icon: LayoutDashboard },
  { title: 'Properties', url: '/landlord/properties', icon: Building2 },
  { title: 'Units', url: '/landlord/units', icon: Home },
  { title: 'Tenants', url: '/landlord/tenants', icon: Users },
  { title: 'Invoices', url: '/landlord/invoices', icon: FileText },
  { title: 'Payments', url: '/landlord/payments', icon: CreditCard, highlight: true },
  { title: 'Receipts', url: '/landlord/receipts', icon: Receipt },
  { title: 'Staff / Users', url: '/landlord/team', icon: Shield },
  { title: 'Reports', url: '/landlord/reports', icon: BarChart },
  { title: 'Settings', url: '/landlord/settings', icon: Settings }
];

function NavItem({ item }: any) {
  return (
    <NavLink
      to={item.url}
      end={item.url === '/landlord'}
      className={({ isActive }) => cn(
        "group relative flex items-center gap-3 px-6 py-3 text-[13px] transition-all rounded-r-2xl mr-4",
        isActive 
          ? "text-bizrent-blue font-bold bg-bizrent-blue/5" 
          : "text-muted-foreground font-semibold hover:text-bizrent-navy hover:bg-muted/40"
      )}
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-bizrent-blue" : "text-muted-foreground/60")} strokeWidth={isActive ? 2.5 : 1.5} />
          <span className="flex-1 truncate tracking-tight">{item.title}</span>
          
          {item.highlight && (
            <span className="bg-[#ffcc00] text-bizrent-navy text-[8px] px-1.5 py-0.5 rounded-md flex items-center font-extrabold uppercase tracking-widest shrink-0 shadow-sm border border-[#ffcc00]/50">
              MoMo
            </span>
          )}

          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-bizrent-blue rounded-r-full shadow-[0_0_8px_rgba(30,64,175,0.4)]" />
          )}
        </>
      )}
    </NavLink>
  );
}

export function LandlordSidebar() {
  const { user, logout } = useAuth();
  const { data: org } = useOrganisation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-border/40 h-screen w-[260px] relative z-20 transition-all duration-300">
      {/* 1. The Header: Identity */}
      <div className="pt-8 pb-6 px-6 shrink-0">
        <BizRentLogo variant="full" size="md" className="text-bizrent-navy mb-8" />
        
        {/* Org Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl border border-border/60 bg-slate-50/50 hover:bg-slate-50 hover:border-border transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] outline-none group">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-7 w-7 rounded-lg bg-white border border-border/40 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Building2 className="h-4 w-4 text-bizrent-blue" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-bold text-bizrent-navy truncate">{org?.name || 'Loading...'}</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50 shrink-0" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[212px] rounded-2xl shadow-xl border-border/40 p-1.5" align="start" sideOffset={12}>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold px-2 py-2">
              Organizations
            </DropdownMenuLabel>
            <DropdownMenuItem className="font-bold text-bizrent-navy py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-slate-50 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded flex items-center justify-center bg-bizrent-blue/10 text-bizrent-blue">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="truncate">{org?.name}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5 opacity-50" />
            <DropdownMenuItem className="text-muted-foreground font-semibold py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-slate-50 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded flex items-center justify-center border border-dashed border-muted-foreground/30">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span>Add Organization</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Unified Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-6 space-y-1">
        {navigationItems.map((item) => (
          <NavItem key={item.title} item={item} />
        ))}
      </div>

      {/* 3. The User Anchor (Footer Card) */}
      <div className="p-5 shrink-0 border-t border-border/40 bg-slate-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-bizrent-navy text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-bizrent-navy/10 relative group cursor-pointer">
            {user?.name?.charAt(0) || 'U'}
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[13px] font-bold text-bizrent-navy truncate leading-tight">{user?.name}</p>
            <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full text-[11px] font-extrabold text-muted-foreground/70 hover:text-bizrent-red hover:bg-bizrent-red/5 transition-all h-9 rounded-xl uppercase tracking-wider" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={2.5} /> Log out
        </Button>
      </div>
    </aside>
  );
}