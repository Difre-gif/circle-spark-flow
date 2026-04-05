import { useState } from 'react';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  BarChart3, Receipt, Shield, Activity, Settings, Home,
  ChevronDown, ChevronsLeft, ChevronsRight, LogOut, Bell
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { BizRentLogo } from '@/components/BizRentLogo';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganisation, useNotifications } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const navGroups = [
  {
    label: 'Management',
    items: [
      { title: 'Dashboard', url: '/landlord', icon: LayoutDashboard },
      { title: 'Properties', url: '/landlord/properties', icon: Building2 },
      { title: 'Units', url: '/landlord/units', icon: Home },
      { title: 'Tenancies', url: '/landlord/tenancies', icon: FileText },
    ]
  },
  {
    label: 'Finance',
    items: [
      { title: 'Payments', url: '/landlord/payments', icon: CreditCard, highlight: true },
      { title: 'Invoices', url: '/landlord/invoices', icon: FileText },
      { title: 'Receipts', url: '/landlord/receipts', icon: Receipt },
      { title: 'Reports', url: '/landlord/reports', icon: BarChart3 },
    ]
  },
  {
    label: 'People',
    items: [
      { title: 'Tenants', url: '/landlord/tenants', icon: Users },
      { title: 'Team', url: '/landlord/team', icon: Shield },
    ]
  },
  {
    label: 'System',
    items: [
      { title: 'Audit Log', url: '/landlord/audit', icon: Activity },
      { title: 'Settings', url: '/landlord/settings', icon: Settings },
    ]
  }
];

export function LandlordSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        "hidden md:flex flex-col bg-white border-r border-border/60 h-screen transition-all duration-300 relative z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-border/60 rounded-full p-1 shadow-sm text-muted-foreground hover:text-bizrent-navy hover:scale-110 transition-all z-30"
      >
        {isCollapsed ? <ChevronsRight className="h-3 w-3" /> : <ChevronsLeft className="h-3 w-3" />}
      </button>

      {/* Top Logo */}
      <div className={cn("h-20 flex items-center border-b border-border/40", isCollapsed ? "justify-center px-0" : "px-6")}>
        <BizRentLogo variant={isCollapsed ? "icon" : "full"} size="md" className="text-bizrent-navy" />
      </div>

      {/* Org Switcher */}
      <div className={cn("p-4 border-b border-border/40 flex items-center gap-3 transition-all", isCollapsed && "justify-center px-2")}>
        <div className="w-10 h-10 rounded-xl bg-bizrent-navy text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
          {org?.name?.charAt(0) || 'O'}
        </div>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden cursor-pointer group">
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-bizrent-navy truncate group-hover:text-bizrent-blue transition-colors">
                {org?.name || 'My Organisation'}
              </p>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-bizrent-blue transition-colors" />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Property Manager</p>
          </div>
        )}
      </div>
      
      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-2">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isPayments = item.highlight;
              
              const linkContent = (isActive: boolean) => (
                <>
                  {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#ffcc00] rounded-r-md" />}
                  <item.icon 
                    className={cn(
                      "shrink-0 transition-all duration-200", 
                      isCollapsed ? "h-6 w-6" : "h-5 w-5",
                      isPayments ? "text-[#ffcc00] drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]" : "",
                      isActive && !isPayments ? "text-bizrent-navy" : "",
                      !isActive && !isPayments ? "text-muted-foreground group-hover:text-bizrent-navy" : ""
                    )} 
                    strokeWidth={isPayments ? 2.5 : 2} 
                  />
                  {!isCollapsed && (
                    <span className={cn(
                      "truncate font-semibold",
                      isPayments && !isActive ? "text-bizrent-navy" : ""
                    )}>
                      {item.title}
                    </span>
                  )}
                  {!isCollapsed && isPayments && (
                    <span className="ml-auto bg-[#ffcc00]/20 text-bizrent-navy text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                      MoMo
                    </span>
                  )}
                </>
              );

              return (
                <Tooltip key={item.title} delayDuration={0} disableHoverableContent={!isCollapsed}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/landlord'}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "w-full",
                        isActive 
                          ? "bg-bizrent-blue/5 text-bizrent-navy shadow-sm" 
                          : "hover:bg-muted/50 text-muted-foreground hover:text-bizrent-navy"
                      )}
                    >
                      {({ isActive }) => linkContent(isActive)}
                    </NavLink>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="font-semibold bg-bizrent-navy text-white border-none shadow-lg">
                      {item.title}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Anchor Footer */}
      <div className={cn("mt-auto border-t border-border/40 p-4 transition-all", isCollapsed && "px-2")}>
        <div className={cn("flex items-center", isCollapsed ? "flex-col gap-4" : "gap-3")}>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-bizrent-navy border border-border/60 shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-bizrent-navy truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize font-medium">{user?.role}</p>
            </div>
          )}

          <div className={cn("flex items-center", isCollapsed ? "flex-col gap-3" : "gap-1")}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-bizrent-navy rounded-full" onClick={() => navigate('/landlord/notifications')}>
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute 1 top-1 right-1 h-2 w-2 rounded-full bg-bizrent-red border border-white" />
                  )}
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Notifications</TooltipContent>}
            </Tooltip>

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-bizrent-red hover:bg-red-50 rounded-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right" className="bg-bizrent-red text-white border-none">Logout</TooltipContent>}
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
}