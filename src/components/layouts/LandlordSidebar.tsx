import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  Shield, Settings, Home, ChevronsUpDown, LogOut, Plus, Receipt, BarChart
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { BizRentLogo } from '@/components/BizRentLogo';
import { cn } from '@/lib/utils';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganisation, useCreateOrganisation } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { can } from '@/lib/permissions';
import { WorkspaceSwitcher } from '@/components/shared/WorkspaceSwitcher';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LandlordSidebar() {
  const { user, logout, userOrgs, switchOrg, orgId, orgRole, isSuperAdmin } = useAuth();
  const { data: org } = useOrganisation();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCountry, setNewOrgCountry] = useState<'RW' | 'KE'>('RW');
  const createOrg = useCreateOrganisation();
  const { t } = useTranslation();

  const allNavItems = useMemo(() => [
    { title: t('nav.dashboard'), url: '/landlord', icon: LayoutDashboard, action: null },
    { title: t('nav.properties'), url: '/landlord/properties', icon: Building2, action: 'property:view' as const },
    { title: t('nav.units'), url: '/landlord/units', icon: Home, action: 'unit:view' as const },
    { title: t('nav.tenants'), url: '/landlord/tenants', icon: Users, action: 'tenant:view' as const },
    { title: t('nav.invoices'), url: '/landlord/invoices', icon: FileText, action: 'invoice:view' as const },
    { title: t('nav.payments'), url: '/landlord/payments', icon: CreditCard, action: 'payment:view' as const, highlight: true },
    { title: t('nav.receipts'), url: '/landlord/receipts', icon: Receipt, action: 'receipt:view' as const },
    { title: t('nav.reports'), url: '/landlord/reports', icon: BarChart, action: 'report:view' as const },
    { title: t('nav.settings'), url: '/landlord/settings', icon: Settings, action: 'settings:view' as const },
  ], [t]);

  const navigationItems = useMemo(
    () => allNavItems.filter(item => !item.action || can(orgRole ?? '', item.action)),
    [orgRole, allNavItems]
  );

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    try {
      await createOrg.mutateAsync({ name: newOrgName, country_code: newOrgCountry });
      toast.success(`Organization "${newOrgName}" created!`);
      setCreateOrgOpen(false);
      setNewOrgName('');
      setNewOrgCountry('RW');
    } catch (error) {
      toast.error('Failed to create organization');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-bizrent-navy text-white transition-all duration-300">
      {/* 1. Header: Branding & Org Switcher */}
      <SidebarHeader className={cn("pt-8 pb-6 transition-all duration-300", isCollapsed ? "px-3" : "px-4")}>
        <div className={cn("px-2 mb-8 transition-all duration-300", isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto")}>
          <BizRentLogo variant="full" size="md" theme="dark" className="text-white" />
        </div>

        <WorkspaceSwitcher
          workspaces={userOrgs.map(o => ({ id: o.id, name: o.name, role: o.role }))}
          activeId={orgId}
          onSwitch={id => { switchOrg(id); navigate('/landlord'); }}
          isCollapsed={isCollapsed}
        />

        {/* New workspace button */}
        {!isCollapsed && (
          <button
            onClick={() => setCreateOrgOpen(true)}
            className="mt-2 w-full flex items-center gap-2.5 px-2 py-2 text-xs text-white/50 hover:text-white/80 transition-colors rounded-xl hover:bg-muted/5"
          >
            <div className="h-6 w-6 rounded flex items-center justify-center border border-dashed border-white/20 shrink-0">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold">{t('workspace.addOrg')}</span>
          </button>
        )}

        <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-bizrent-navy dark:text-white">{t('workspace.newWorkspace')}</DialogTitle>
              <DialogDescription className="font-medium">
                {t('workspace.newWorkspaceDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-bizrent-navy dark:text-white font-bold px-1">{t('workspace.orgName')}</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Blue Sky Properties" 
                  className="rounded-2xl h-12 border-border/60 focus-visible:ring-bizrent-blue/20"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-bizrent-navy dark:text-white font-bold px-1">{t('workspace.country')}</Label>
                <Select value={newOrgCountry} onValueChange={value => setNewOrgCountry(value as 'RW' | 'KE')}>
                  <SelectTrigger className="rounded-2xl h-12 border-border/60 focus:ring-bizrent-blue/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RW">{t('countries.rwanda')} (RW)</SelectItem>
                    <SelectItem value="KE">{t('countries.kenya')} (KE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setCreateOrgOpen(false)}>{t('actions.cancel')}</Button>
              <Button 
                className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-bizrent-navy/10"
                onClick={handleCreateOrg}
                disabled={createOrg.isPending || !newOrgName.trim()}
              >
                {createOrg.isPending ? t('workspace.creating') : t('workspace.createWorkspace')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarHeader>

      {/* 2. Primary Navigation */}
      <SidebarContent className={cn("transition-all duration-300", isCollapsed ? "px-3" : "px-2")}>
        <SidebarMenu className={cn("mt-2", isCollapsed ? "gap-3" : "gap-1")}>
          {navigationItems.map((item) => {
            // Updated logic to ensure top-level match doesn't falsely trigger for sub-routes if it's the exact Dashboard route
            const isActive = location.pathname === item.url || (item.url !== '/landlord' && location.pathname.startsWith(item.url));

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "relative w-full py-6 transition-all rounded-2xl group",
                    isCollapsed && "group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!p-0",
                    isActive
                      ? isCollapsed
                        ? "bg-white/12 text-white ring-1 ring-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                        : "bg-bizrent-blue/20 text-white"
                      : "text-white/70 hover:bg-muted/10 hover:text-white"
                  )}
                >
                  <NavLink
                    to={item.url}
                    end={item.url === '/landlord'}
                    className={cn(
                      "flex items-center w-full h-full",
                      isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                        isActive
                          ? isCollapsed
                            ? "text-white"
                            : "text-bizrent-blue"
                          : "text-white/60 group-hover:text-white"
                      )}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.title}</span>}
                    
                    {!isCollapsed && item.highlight && (
                      <div className="ml-auto flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="bg-bizrent-amber text-bizrent-navy dark:text-white text-xxxs px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-widest shadow-sm border border-bizrent-amber/50 cursor-help">
                              {t('legacy.momo')}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{t('legacy.paymentsViaMtnMobileMoney')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    
                    {isActive && (
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 bg-bizrent-blue shadow-[0_0_12px_rgba(30,64,175,0.4)]",
                        isCollapsed
                          ? "left-[-0.75rem] h-7 w-1 rounded-r-full"
                          : "left-0 h-8 w-1 rounded-r-full"
                      )} />
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* 3. Footer: User Anchor */}
      <SidebarFooter className={cn("border-t border-white/10 bg-black/10 transition-all duration-300", isCollapsed ? "p-3" : "p-4")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn("flex items-center gap-3 w-full cursor-pointer hover:bg-muted/10 p-2 rounded-xl transition-colors", isCollapsed && "justify-center p-0 hover:bg-transparent")}>
              <div className={cn(
                "rounded-2xl bg-card text-bizrent-navy dark:text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-black/20 relative group transition-transform hover:scale-105 active:scale-95",
                isCollapsed ? "h-12 w-12" : "h-10 w-10"
              )}>
                {getInitials(user?.name)}
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 border-[3px] border-bizrent-navy rounded-full transition-transform group-hover:scale-110" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate leading-tight">{user?.name}</p>
                  <p className="text-xs font-medium text-white/70 truncate mt-0.5">{user?.email}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[212px] rounded-2xl shadow-xl border-border/40 p-1.5" align="start" sideOffset={12}>
            <DropdownMenuLabel className="text-xxs text-muted-foreground uppercase tracking-widest font-extrabold px-2 py-2">{t('workspace.myAccount')}</DropdownMenuLabel>
            
            {isSuperAdmin && (
              <>
                <DropdownMenuItem className="font-bold text-indigo-700 py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-indigo-50 flex items-center gap-2.5" onClick={() => navigate('/super-admin')}>
                  <div className="h-6 w-6 rounded flex items-center justify-center bg-indigo-100 text-indigo-700"><Shield className="h-3.5 w-3.5" /></div>
                  <span>{t('workspace.superAdminPortal')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5 opacity-50" />
              </>
            )}

            <DropdownMenuItem className="font-bold text-bizrent-navy dark:text-white py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-muted/40 flex items-center gap-2.5" onClick={() => navigate('/landlord/profile')}>
              <div className="h-6 w-6 rounded flex items-center justify-center bg-bizrent-navy/10 text-bizrent-navy dark:text-white"><Settings className="h-3.5 w-3.5" /></div>
              <span>{t('nav.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5 opacity-50" />
            <DropdownMenuItem 
              className="text-bizrent-red font-semibold py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-red-50 focus:text-bizrent-red flex items-center gap-2.5"
              onClick={handleLogout}
            >
              <div className="h-6 w-6 rounded flex items-center justify-center bg-red-100 text-bizrent-red"><LogOut className="h-3.5 w-3.5" /></div>
              <span>{t('legacy.logOut')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}