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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-bizrent-navy shadow-xl">
      <SidebarHeader className="p-4 flex items-center justify-center h-16 border-b border-white/10">
        {collapsed ? (
          <BizRentLogo variant="icon" size="sm" className="text-white drop-shadow-md" />
        ) : (
          <BizRentLogo variant="full" size="md" className="text-white drop-shadow-md" />
        )}
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className="h-10 transition-all duration-200"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/landlord'}
                      className="hover:bg-white/10 text-white/80 hover:text-white rounded-lg"
                      activeClassName="bg-bizrent-blue text-white font-semibold shadow-sm"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {!collapsed && <span className="ml-1 tracking-wide">{item.title}</span>}
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