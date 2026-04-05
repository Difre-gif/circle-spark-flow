import {
  LayoutDashboard, Building2, Users, FileText, CreditCard,
  BarChart3, Receipt, Shield, ScrollText, Settings, Home
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { BizRentLogo } from '@/components/BizRentLogo';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
];

export function LandlordSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-20 bg-background border-r border-border/50 h-screen py-6 items-center z-20">
      <div className="mb-8">
        <BizRentLogo variant="icon" size="md" className="text-bizrent-navy" />
      </div>
      
      <div className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto no-scrollbar items-center">
        {navItems.map((item) => (
          <Tooltip key={item.title} delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.url}
                end={item.url === '/landlord'}
                className={({ isActive }) => cn(
                  "flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-200 group",
                  isActive 
                    ? "bg-bizrent-navy text-white shadow-md shadow-bizrent-navy/20" 
                    : "text-muted-foreground hover:bg-white hover:text-bizrent-navy hover:shadow-sm"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110")} />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-semibold">{item.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="mt-auto pt-4 px-3 w-full flex justify-center">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <NavLink
              to="/landlord/settings"
              className={({ isActive }) => cn(
                "flex items-center justify-center h-12 w-12 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-muted text-bizrent-navy" 
                  : "text-muted-foreground hover:bg-white hover:text-bizrent-navy hover:shadow-sm"
              )}
            >
              <Settings className="h-5 w-5 transition-transform group-hover:rotate-45" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold">Settings</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}