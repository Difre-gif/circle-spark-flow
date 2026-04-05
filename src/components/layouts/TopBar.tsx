import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useSupabaseData';
import { BizRentLogo } from '../BizRentLogo';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-border/40">
      {/* Left: Sidebar Toggle & Mobile Logo */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-10 w-10 rounded-xl bg-white border border-border/60 shadow-sm text-bizrent-navy hover:bg-slate-50 transition-all active:scale-95" />
        <div className="md:hidden flex items-center gap-3">
          <BizRentLogo variant="icon" size="sm" className="text-bizrent-navy" />
        </div>
      </div>

      {/* Center: Breadcrumbs space (hidden on mobile) */}
      <div className="hidden md:flex flex-1 items-center px-4">
        {/* Future breadcrumbs can go here */}
      </div>

      {/* Right: Global Search & Mobile Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search - Visible on Desktop */}
        <div className="relative hidden md:block w-72 group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-bizrent-navy" />
          <Input 
            placeholder="Search properties, tenants..." 
            className="pl-11 h-11 rounded-full bg-muted/30 border-transparent shadow-sm focus-visible:ring-bizrent-navy/20 focus-visible:bg-white transition-all text-sm font-medium" 
          />
        </div>

        {/* Mobile Actions (Hidden on Desktop because Sidebar handles this) */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-white shadow-sm border border-border/50 text-bizrent-navy" onClick={() => navigate('/landlord/notifications')}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bizrent-red text-[9px] font-bold text-white shadow-sm border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-bizrent-navy text-white text-sm font-bold shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2">
              <div className="px-3 py-2">
                <p className="text-sm font-bold text-bizrent-navy">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer py-2 rounded-xl text-bizrent-red focus:text-bizrent-red focus:bg-bizrent-red/10" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}