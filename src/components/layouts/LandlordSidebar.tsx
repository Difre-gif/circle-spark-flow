import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  BarChart3, Receipt, Shield, ScrollText, Settings, Home
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/landlord', icon: LayoutDashboard },
  { title: 'Properties', url: '/landlord/properties', icon: Building2 },
  { title: 'Units', url: '/landlord/units', icon: Home },
  { title: 'Tenants', url: '/landlord/tenants', icon: Users },
  { title: 'Tenancies', url: '/landlord/tenancies', icon: FileText },
  { title: 'Invoices', url: '/landlord/invoices', icon: FileText },
  { title: 'Payments', url: '/landlord/payments', icon: CreditCard },
  { title: 'Reports', url: '/landlord/reports', icon: BarChart3 },
  { title: 'Receipts', url: '/landlord/receipts', icon: Receipt },
  { title: 'Team', url: '/landlord/team', icon: Shield },
  { title: 'Audit Log', url: '/landlord/audit', icon: ScrollText },
  { title: 'Settings', url: '/landlord/settings', icon: Settings },
];

export function LandlordSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === '/landlord') return location.pathname === '/landlord';
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        {collapsed ? (
          <BizRentLogo variant="icon" size="sm" className="text-sidebar-foreground" />
        ) : (
          <BizRentLogo variant="full" size="md" className="text-sidebar-foreground" />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/landlord'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
