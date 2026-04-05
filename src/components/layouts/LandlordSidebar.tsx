import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  BarChart3, Shield, Settings, Home,
  ChevronDown, ChevronsUpDown, LogOut, Plus
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { BizRentLogo } from '@/components/BizRentLogo';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganisation } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { title: 'Dashboard', url: '/landlord', icon: LayoutDashboard }
    ]
  },
  {
    label: 'COLLECTIONS',
    items: [
      { title: 'Invoices', url: '/landlord/invoices', icon: FileText },
      { title: 'Payments', url: '/landlord/payments', icon: CreditCard, highlight: true }
    ]
  },
  {
    label: 'MANAGEMENT',
    items: [
      { title: 'Properties', url: '/landlord/properties', icon: Building2 },
      { title: 'Units', url: '/landlord/units', icon: Home },
      { title: 'Tenants', url: '/landlord/tenants', icon: Users }
    ]
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { title: 'Staff / Users', url: '/landlord/team', icon: Shield },
      { title: 'Reports', url: '/landlord/reports', icon: BarChart3 },
      { title: 'Settings', url: '/landlord/settings', icon: Settings }
    ]
  }
];

function NavItem({ item }: { item: any }) {
  return (
    <NavLink
      to={item.url}
      end={item.url === '/landlord'}
      className={({ isActive }) => cn(
        "group relative flex items-center gap-3 px-3 py-3 text-sm transition-all rounded-lg mx-3",
        isActive 
          ? "text-bizrent-navy font-bold bg-bizrent-blue/5" 
          : "text-muted-foreground font-medium hover:text-bizrent-navy hover:bg-slate-100/50"
      )}
    >
      {({ isActive }) => (
        <>
          {/* 3px Active Indicator on the absolute far left of the sidebar */}
          {isActive && <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-[70%] w-[3px] bg-bizrent-blue rounded-r-md" />}
          
          <item.icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-bizrent-blue" : "text-muted-foreground group-hover:text-bizrent-navy")} strokeWidth={1.5} />
          <span className="flex-1">{item.title}</span>
          
          {item.highlight && (
            <span className="bg-[#ffcc00]/20 text-bizrent-navy text-[10px] px-2 py-0.5 rounded-full flex items-center font-bold uppercase tracking-wider">
              MoMo
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function NavSection({ section }: { section: any }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6">
      {section.label && (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-6 mb-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest hover:text-bizrent-navy transition-colors"
        >
          {section.label}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !isOpen && "-rotate-90")} strokeWidth={2} />
        </button>
      )}
      
      {isOpen && (
        <div className="space-y-1">
          {section.items.map((item: any) => <NavItem key={item.title} item={item} />)}
        </div>
      )}
    </div>
  );
}

export function LandlordSidebar() {
  const { user, logout } = useAuth();
  const { data: org } = useOrganisation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col bg-[#FCFDFE] dark:bg-background border-r border-border/60 h-screen w-[260px] relative z-20 shadow-[1px_0_10px_rgba(0,0,0,0.01)]">
      {/* 1. The Header: Identity */}
      <div className="h-[76px] flex items-center px-6 shrink-0">
        <BizRentLogo variant="full" size="sm" className="text-bizrent-navy" />
      </div>

      {/* 1b. Org Switcher (Pill Shaped) */}
      <div className="px-4 mb-8 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-full border border-border/80 bg-white hover:bg-slate-50 transition-colors shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-bizrent-blue/20">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-6 w-6 rounded-full bg-bizrent-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {org?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-semibold text-bizrent-navy truncate">{org?.name || 'Apex Rentals'}</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl shadow-lg border-border/60 p-1" align="start" sideOffset={8}>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold px-2 py-1.5">
              Your Organizations
            </DropdownMenuLabel>
            <DropdownMenuItem className="font-semibold text-bizrent-navy py-2 px-2 cursor-pointer rounded-lg focus:bg-slate-100">
              <div className="h-5 w-5 rounded-full bg-bizrent-navy text-white flex items-center justify-center text-[10px] mr-2 shrink-0">
                {org?.name?.charAt(0) || 'A'}
              </div>
              <span className="truncate">{org?.name || 'Apex Rentals'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60" />
            <DropdownMenuItem className="text-muted-foreground font-medium py-2 px-2 cursor-pointer rounded-lg focus:bg-slate-100">
              <Plus className="mr-2 h-4 w-4" strokeWidth={2} /> Add Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Grouped Navigation (Accordion Style) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {navSections.map((section) => (
          <NavSection key={section.label} section={section} />
        ))}
      </div>

      {/* 4. The User Anchor (Footer) */}
      <div className="mt-auto border-t border-border/60 p-5 bg-[#FCFDFE]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-bizrent-navy text-white flex items-center justify-center font-bold shrink-0 shadow-sm border border-border/50">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-bizrent-navy truncate leading-tight">{user?.name || 'System Admin'}</p>
            <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{user?.role || 'Owner'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-bizrent-red hover:bg-bizrent-red/10 rounded-full shrink-0 transition-colors" 
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </aside>
  );
}