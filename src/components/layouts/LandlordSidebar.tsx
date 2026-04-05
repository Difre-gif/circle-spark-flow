import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  Shield, Settings, Home, ChevronDown, ChevronsUpDown, LogOut, Plus
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
    label: 'Home',
    icon: LayoutDashboard,
    items: [
      { title: 'Dashboard', url: '/landlord' }
    ]
  },
  {
    label: 'Management',
    icon: Building2,
    items: [
      { title: 'Properties', url: '/landlord/properties' },
      { title: 'Units', url: '/landlord/units' },
      { title: 'Tenants', url: '/landlord/tenants' },
      { title: 'Tenancies', url: '/landlord/tenancies' }
    ]
  },
  {
    label: 'Collections',
    icon: CreditCard,
    items: [
      { title: 'Invoices', url: '/landlord/invoices' },
      { title: 'Payments', url: '/landlord/payments', highlight: true },
      { title: 'Receipts', url: '/landlord/receipts' },
      { title: 'Reports', url: '/landlord/reports' }
    ]
  },
  {
    label: 'System',
    icon: Settings,
    items: [
      { title: 'Users', url: '/landlord/team' },
      { title: 'Audit Log', url: '/landlord/audit' },
      { title: 'Settings', url: '/landlord/settings' }
    ]
  }
];

function NavItem({ item }: { item: any }) {
  return (
    <NavLink
      to={item.url}
      end={item.url === '/landlord'}
      className={({ isActive }) => cn(
        "group relative flex items-center gap-3 pl-[48px] pr-6 py-2 text-[13px] transition-all",
        isActive 
          ? "text-bizrent-blue font-bold bg-bizrent-blue/10" 
          : "text-muted-foreground font-medium hover:text-bizrent-navy hover:bg-muted/40"
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-[32.5px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-bizrent-blue z-10" />
          )}
          
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

function NavSection({ section, currentPath }: { section: any, currentPath: string }) {
  const isSectionActive = section.items.some((i: any) => i.url === currentPath || (i.url !== '/landlord' && currentPath.startsWith(i.url)));
  const [isOpen, setIsOpen] = useState(isSectionActive || section.label === 'Home');

  return (
    <div className="mb-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-2.5 text-sm font-semibold text-bizrent-navy hover:text-bizrent-blue transition-colors outline-none"
      >
        <div className="flex items-center gap-3">
          <section.icon className={cn("h-5 w-5", isSectionActive ? "text-bizrent-blue" : "text-muted-foreground")} strokeWidth={1.5} />
          <span>{section.label}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !isOpen && "-rotate-90")} strokeWidth={1.5} />
      </button>
      
      {isOpen && (
        <div className="relative py-1 space-y-0.5">
          {/* Vertical Guide Line */}
          <div className="absolute left-[33px] top-0 bottom-3 w-px bg-border/80" />
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
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col bg-[#F8F9FA] border-r border-border/40 h-screen w-[260px] relative z-20">
      {/* 1. The Header: Identity */}
      <div className="pt-6 pb-4 px-6 shrink-0">
        <BizRentLogo variant="full" size="md" className="text-bizrent-navy mb-6" />
        
        {/* Org Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-border/80 bg-white hover:bg-slate-50 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-bizrent-blue/20">
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-bold text-bizrent-navy truncate">{org?.name || 'Loading...'}</span>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[212px] rounded-xl shadow-lg border-border/60 p-1" align="start" sideOffset={8}>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold px-2 py-1.5">
              Organizations
            </DropdownMenuLabel>
            <DropdownMenuItem className="font-semibold text-bizrent-navy py-2 px-2 cursor-pointer rounded-lg focus:bg-slate-100">
              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{org?.name}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/60" />
            <DropdownMenuItem className="text-muted-foreground font-medium py-2 px-2 cursor-pointer rounded-lg focus:bg-slate-100">
              <Plus className="mr-2 h-4 w-4" strokeWidth={2} /> Add Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Grouped Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-4">
        {navSections.map((section) => (
          <NavSection key={section.label} section={section} currentPath={location.pathname} />
        ))}
      </div>

      {/* 3. The User Anchor (Footer Card) */}
      <div className="p-4 shrink-0">
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-bizrent-blue/10 text-bizrent-blue flex items-center justify-center font-bold shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-bizrent-navy truncate leading-tight">{user?.name}</p>
                <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full text-xs font-bold text-muted-foreground hover:text-bizrent-red hover:bg-bizrent-red/10 border-border/50 transition-colors h-8 rounded-lg" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={2} /> Log out
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}