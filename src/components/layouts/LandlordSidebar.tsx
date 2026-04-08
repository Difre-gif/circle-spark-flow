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
import { useState } from 'react';

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

export function LandlordSidebar() {
  const { user, logout, userOrgs, switchOrg, orgId, isSuperAdmin } = useAuth();
  const { data: org } = useOrganisation();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const createOrg = useCreateOrganisation();

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    try {
      await createOrg.mutateAsync({ name: newOrgName, country_code: 'RW' });
      toast.success(`Organization "${newOrgName}" created!`);
      setCreateOrgOpen(false);
      setNewOrgName('');
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
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-white transition-all duration-300">
      {/* 1. Header: Branding & Org Switcher */}
      <SidebarHeader className="pt-8 pb-6 px-4">
        <div className={cn("px-2 mb-8 transition-all duration-300", isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto")}>
          <BizRentLogo variant="full" size="md" className="text-bizrent-navy" />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="w-full h-12 px-2 rounded-2xl border border-border/60 bg-slate-50/50 hover:bg-slate-50 shadow-sm transition-all group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:justify-center">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 rounded-xl bg-white border border-border/40 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <Building2 className="h-4 w-4 text-bizrent-blue" />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-[13px] font-bold text-bizrent-navy truncate w-[130px]">{org?.name || 'Loading...'}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Workspace</span>
                  </div>
                )}
              </div>
              {!isCollapsed && <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[212px] rounded-2xl shadow-xl border-border/40 p-1.5" align="start" sideOffset={12}>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold px-2 py-2">Organizations</DropdownMenuLabel>
            
            {userOrgs.map((o) => (
              <DropdownMenuItem 
                key={o.id}
                className={cn(
                  "py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-slate-50 flex items-center gap-2.5 mb-1",
                  o.id === orgId ? "font-bold text-bizrent-navy bg-slate-50/50" : "font-medium text-muted-foreground"
                )}
                onClick={() => {
                  if (o.id !== orgId) {
                    switchOrg(o.id);
                    navigate('/landlord');
                  }
                }}
              >
                <div className={cn(
                  "h-6 w-6 rounded flex items-center justify-center",
                  o.id === orgId ? "bg-bizrent-blue/10 text-bizrent-blue" : "bg-muted text-muted-foreground"
                )}>
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-xs">{o.name}</span>
                  {o.role !== 'OWNER' && <span className="text-[8px] uppercase tracking-widest opacity-60 font-extrabold">{o.role}</span>}
                </div>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="my-1.5 opacity-50" />
            <DropdownMenuItem 
              className="text-muted-foreground font-semibold py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-slate-50 flex items-center gap-2.5"
              onClick={() => setCreateOrgOpen(true)}
            >
              <div className="h-6 w-6 rounded flex items-center justify-center border border-dashed border-muted-foreground/30"><Plus className="h-3.5 w-3.5" /></div>
              <span>Add Organization</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold text-bizrent-navy">New Workspace</DialogTitle>
              <DialogDescription className="font-medium">
                Create a new organization to manage separate portfolios.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-bizrent-navy font-bold px-1">Organization Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Blue Sky Properties" 
                  className="rounded-2xl h-12 border-border/60 focus-visible:ring-bizrent-blue/20"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setCreateOrgOpen(false)}>Cancel</Button>
              <Button 
                className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-bizrent-navy/10"
                onClick={handleCreateOrg}
                disabled={createOrg.isPending || !newOrgName.trim()}
              >
                {createOrg.isPending ? 'Creating...' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarHeader>

      {/* 2. Primary Navigation */}
      <SidebarContent className="px-2">
        <SidebarMenu className="gap-1 mt-2">
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
                    isActive ? "bg-bizrent-blue/5 text-bizrent-blue" : "text-muted-foreground hover:bg-slate-50 hover:text-bizrent-navy"
                  )}
                >
                  <NavLink to={item.url} end={item.url === '/landlord'} className="flex items-center gap-3 w-full h-full px-4">
                    <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-bizrent-blue" : "text-muted-foreground/60")} strokeWidth={isActive ? 2.5 : 1.5} />
                    {!isCollapsed && <span className="text-[13px] font-bold tracking-tight">{item.title}</span>}
                    
                    {!isCollapsed && item.highlight && (
                      <div className="ml-auto flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="bg-[#ffcc00] text-bizrent-navy text-[8px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-widest shadow-sm border border-[#ffcc00]/50 cursor-help">
                              MoMo
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Payments via MTN Mobile Money</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-bizrent-blue rounded-r-full shadow-[0_0_12px_rgba(30,64,175,0.4)]" />
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* 3. Footer: User Anchor */}
      <SidebarFooter className="p-4 border-t border-border/40 bg-slate-50/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn("flex items-center gap-3 w-full cursor-pointer hover:bg-black/5 p-2 rounded-xl transition-colors", isCollapsed && "justify-center p-0")}>
              <div className="h-10 w-10 rounded-2xl bg-bizrent-navy text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-bizrent-navy/10 relative group transition-transform hover:scale-105 active:scale-95">
                {getInitials(user?.name)}
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-green-500 border-[3px] border-white rounded-full transition-transform group-hover:scale-110" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-[13px] font-bold text-bizrent-navy truncate leading-tight">{user?.name}</p>
                  <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[212px] rounded-2xl shadow-xl border-border/40 p-1.5" align="start" sideOffset={12}>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-extrabold px-2 py-2">My Account</DropdownMenuLabel>
            
            {isSuperAdmin && (
              <>
                <DropdownMenuItem className="font-bold text-indigo-700 py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-indigo-50 flex items-center gap-2.5" onClick={() => navigate('/super-admin')}>
                  <div className="h-6 w-6 rounded flex items-center justify-center bg-indigo-100 text-indigo-700"><Shield className="h-3.5 w-3.5" /></div>
                  <span>Super Admin Portal</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5 opacity-50" />
              </>
            )}

            <DropdownMenuItem className="font-bold text-bizrent-navy py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-slate-50 flex items-center gap-2.5" onClick={() => navigate('/landlord/settings')}>
              <div className="h-6 w-6 rounded flex items-center justify-center bg-bizrent-navy/10 text-bizrent-navy"><Settings className="h-3.5 w-3.5" /></div>
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1.5 opacity-50" />
            <DropdownMenuItem 
              className="text-bizrent-red font-semibold py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-red-50 focus:text-bizrent-red flex items-center gap-2.5"
              onClick={handleLogout}
            >
              <div className="h-6 w-6 rounded flex items-center justify-center bg-red-100 text-bizrent-red"><LogOut className="h-3.5 w-3.5" /></div>
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}