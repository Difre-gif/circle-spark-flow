import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useSupabaseData';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { BizRentLogo } from '../BizRentLogo';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;
  const recentNotifications = (notifications ?? []).slice(0, 10);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) markRead.mutate(notification.id);
    if (notification.reference_type === 'PAYMENT' && notification.reference_id) navigate(`/landlord/payments/${notification.reference_id}`);
    else if (notification.reference_type === 'INVOICE' && notification.reference_id) navigate(`/landlord/invoices/${notification.reference_id}`);
    else if (notification.reference_type === 'RECEIPT') navigate('/landlord/receipts');
    else navigate('/landlord/notifications');
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-4 md:px-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      {/* Left: Mobile Logo */}
      <div className="md:hidden flex items-center">
        <BizRentLogo variant="full" size="sm" className="text-bizrent-navy" />
      </div>

      {/* Center: Pill Navigation (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 justify-start">
        <nav className="flex items-center gap-1 bg-white rounded-full p-1.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-border/50">
          {[
            { name: 'Overview', path: '/landlord' },
            { name: 'Properties', path: '/landlord/properties' },
            { name: 'Invoices', path: '/landlord/invoices' },
            { name: 'Payments', path: '/landlord/payments' },
            { name: 'Reports', path: '/landlord/reports' },
          ].map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/landlord'}
              className={({ isActive }) => cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-bizrent-navy text-white shadow-sm" 
                  : "text-muted-foreground hover:text-bizrent-navy hover:bg-muted/80"
              )}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden xl:block w-64 group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-bizrent-navy" />
          <Input 
            placeholder="Search..." 
            className="pl-10 h-10 rounded-full bg-white border-border/50 shadow-sm focus-visible:ring-bizrent-navy/20 transition-all" 
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-white shadow-sm border border-border/50 hover:bg-muted">
              <Bell className="h-5 w-5 text-bizrent-navy" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-bizrent-red text-[10px] font-bold text-white shadow-sm border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-bold text-bizrent-navy">Notifications</p>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-bizrent-blue" onClick={() => markAllRead.mutate()}>
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up!</div>
              ) : (
                recentNotifications.map(n => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 cursor-pointer p-3 rounded-xl focus:bg-muted/50" onClick={() => handleNotificationClick(n)}>
                    <div className="flex items-center gap-2 w-full">
                      {!n.is_read && <div className="h-2 w-2 rounded-full bg-bizrent-blue flex-shrink-0" />}
                      <span className="text-sm font-semibold truncate flex-1">{n.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/80 font-medium mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 pl-2 pr-4 rounded-full bg-white shadow-sm border border-border/50 hover:bg-muted flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bizrent-navy text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-bold text-bizrent-navy leading-none">
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5 capitalize">{user?.role}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2">
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-bizrent-navy">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2 rounded-xl focus:bg-muted" onClick={() => navigate('/landlord/settings')}>
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2 rounded-xl text-bizrent-red focus:text-bizrent-red focus:bg-bizrent-red/10" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}