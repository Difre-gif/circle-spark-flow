import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  BarChart3, Receipt, Shield, Activity, Settings, Home,
  ChevronDown, ChevronRight, ChevronsUpDown, LogOut, Bell
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { BizRentLogo } from '@/components/BizRentLogo';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganisation, useNotifications } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';

// --- Navigation Structure ---
const navConfig = [
  { 
    title: 'Dashboard', 
    url: '/landlord', 
    icon: LayoutDashboard 
  },
  {
    title: 'Management',
    icon: Building2,
    items: [
      { title: 'Properties', url: '/landlord/properties' },
      { title: 'Units', url: '/landlord/units' },
      { title: 'Tenants', url: '/landlord/tenants' },
      { title: 'Tenancies', url: '/landlord/tenancies' },
    ]
  },
  {
    title: 'Finance',
    icon: CreditCard,
    items: [
      { title: 'Payments', url: '/landlord/payments', highlight: true },
      { title: 'Invoices', url: '/landlord/invoices' },
      { title: 'Receipts', url: '/landlord/receipts' },
      { title: 'Reports', url: '/landlord/reports' },
    ]
  },
  {
    title: 'Settings',
    icon: Settings,
    items: [
      { title: 'Organization', url: '/landlord/settings' },
      { title: 'Team', url: '/landlord/team' },
      { title: 'Audit Log', url: '/landlord/audit' },
    ]
  }
];

// --- Subcomponent: Collapsible Nav Group ---
function NavGroup({ group, isCollapsed, currentPath }: { group: any, isCollapsed: boolean, currentPath: string }) {
  const isActiveGroup = group.items.some((item: any) => currentPath === item.url || currentPath.startsWith(item.url + '/'));
  const [isOpen, setIsOpen] = useState(isActiveGroup);

  // Auto-open if navigating to a child
  useEffect(() => {
    if (isActiveGroup) setIsOpen(true);
  }, [isActiveGroup]);

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center justify-center w-12 h-12 mx-auto rounded-xl cursor-pointer text-muted-foreground hover:text-bizrent-navy hover:bg-black/5 transition-colors",
            isActiveGroup && "text-bizrent-navy bg-bizrent-blue/5"
          )}>
            <group.icon className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-bizrent-navy text-white border-none font-semibold">
          {group.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors hover:bg-black/5 rounded-lg",
          isActiveGroup ? "text-bizrent-navy" : "text-muted-foreground hover:text-bizrent-navy"
        )}
      >
        <div className="flex items-center gap-3">
          <group.icon className="h-5 w-5" strokeWidth={1.5} />
          <span>{group.title}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4 opacity-50" /> : <ChevronRight className="h-4 w-4 opacity-50" />}
      </button>
      
      {isOpen && (
        <div className="pl-11 pr-3 space-y-1 mt-1 mb-2">
          {group.items.map((item: any) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={({ isActive }) => cn(
                "flex items-center justify-between py-2 px-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden",
                isActive 
                  ? "text-bizrent-navy bg-white shadow-sm" 
                  : "text-muted-foreground hover:text-bizrent-navy hover:bg-black/5"
              )}
            >
              {({ isActive }) => (
                <>
                  {/* 3px Active Indicator */}
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-bizrent-blue rounded-r-full" />}
                  
                  <span className={cn(item.highlight && !isActive && "text-bizrent-navy font-semibold")}>
                    {item.title}
                  </span>
                  
                  {item.highlight && (
                    <span className="bg-[#ffcc00]/20 text-bizrent-navy text-[9px] px-1.5 py-0.5 rounded flex items-center font-bold uppercase tracking-wider">
                      MoMo
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function LandlordSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: org } = useOrganisation();
  const { data: notifications } = useNotifications();
  const navigate = useNavigate();

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col bg-[#F8F9FA] border-r border-border/40 h-screen transition-all duration-300 relative z-20",
        isCollapsed ? "w-20" : "w-[260px]"
      )}
    >
      {/* Brand Header */}
      <div className={cn("h-20 flex items-center shrink-0", isCollapsed ? "justify-center px-0" : "px-6")}>
        <BizRentLogo variant={isCollapsed ? "icon" : "full"} size="md" className="text-bizrent-navy" />
      </div>

      {/* Organization Switcher */}
      <div className="px-3 pb-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 transition-colors text-left border border-transparent hover:border-border/50",
              isCollapsed && "justify-center"
            )}>
              <div className="h-8 w-8 rounded-lg bg-bizrent-navy text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                {org?.name?.charAt(0) || 'O'}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-bizrent-navy truncate">{org?.name || 'My Organization'}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Property Manager</p>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align={isCollapsed ? "center" : "start"} sideOffset={8}>
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Your Organizations</DropdownMenuLabel>
            <DropdownMenuItem className="font-semibold text-bizrent-navy">
              <div className="h-5 w-5 rounded bg-bizrent-navy text-white flex items-center justify-center text-xs mr-2 shrink-0">
                {org?.name?.charAt(0) || 'O'}
              </div>
              <span className="truncate">{org?.name || 'My Organization'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground" disabled>
              <Building2 className="mr-2 h-4 w-4" /> Create new organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 space-y-2 pb-4">
        {navConfig.map((item) => {
          if (item.items) {
            return <NavGroup key={item.title} group={item} isCollapsed={isCollapsed} currentPath={location.pathname} />;
          }

          // Top level single items (Dashboard)
          return (
            <Tooltip key={item.title} delayDuration={0} disableHoverableContent={!isCollapsed}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.url!}
                  end={item.url === '/landlord'}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 py-3 rounded-lg text-sm font-semibold transition-all relative overflow-hidden",
                    isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-4 w-full",
                    isActive 
                      ? "text-bizrent-navy bg-white shadow-sm" 
                      : "text-muted-foreground hover:text-bizrent-navy hover:bg-black/5"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-bizrent-blue rounded-r-full" />}
                      <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </>
                  )}
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="bg-bizrent-navy text-white border-none font-semibold">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>

      {/* User Footer Profile Card */}
      <div className="p-3 shrink-0">
        <div className={cn(
          "bg-white rounded-xl shadow-sm border border-border/50 flex items-center p-2",
          isCollapsed ? "flex-col gap-3 py-4" : "gap-3"
        )}>
          <div className="h-9 w-9 rounded-full bg-bizrent-blue/10 text-bizrent-blue flex items-center justify-center font-bold shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-bizrent-navy truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground font-semibold capitalize tracking-wide truncate">{user?.role}</p>
            </div>
          )}

          <div className={cn("flex", isCollapsed ? "flex-col gap-2" : "items-center gap-0.5")}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-bizrent-navy hover:bg-black/5" onClick={() => navigate('/landlord/settings')}>
                  <Settings className="h-4 w-4" strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"} className="font-semibold text-xs">Settings</TooltipContent>
            </Tooltip>
            
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-bizrent-red hover:bg-bizrent-red/10" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"} className="font-semibold text-xs text-bizrent-red">Logout</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
}