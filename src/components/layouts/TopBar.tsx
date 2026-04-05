import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useSupabaseData';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatDistanceToNow } from 'date-fns';

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
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }
    if (notification.reference_type === 'PAYMENT' && notification.reference_id) {
      navigate(`/landlord/payments/${notification.reference_id}`);
    } else if (notification.reference_type === 'INVOICE' && notification.reference_id) {
      navigate(`/landlord/invoices/${notification.reference_id}`);
    } else if (notification.reference_type === 'RECEIPT') {
      navigate('/landlord/receipts');
    } else {
      navigate('/landlord/notifications');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-white/95 px-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <SidebarTrigger className="md:hidden" />
      
      <div className="hidden md:flex md:flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-bizrent-navy" />
          <Input 
            placeholder="Search properties, tenants, invoices..." 
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-white focus-visible:ring-bizrent-navy/20 transition-all" 
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-bizrent-navy/5 rounded-full">
              <Bell className="h-5 w-5 text-bizrent-slate" />
              {unreadCount > 0 && (
                <span className="absolute 1 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-bizrent-red text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-bold text-bizrent-navy">Notifications</p>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-auto py-1 text-bizrent-blue hover:text-bizrent-navy" onClick={() => markAllRead.mutate()}>
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
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 cursor-pointer p-4 focus:bg-bizrent-navy/5" onClick={() => handleNotificationClick(n)}>
                    <div className="flex items-center gap-2 w-full">
                      {!n.is_read && <div className="h-2 w-2 rounded-full bg-bizrent-blue flex-shrink-0" />}
                      <span className="text-sm font-semibold truncate flex-1">{n.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="text-xs text-muted-foreground/80 font-medium">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-bizrent-blue font-medium text-sm cursor-pointer py-3 hover:text-bizrent-navy hover:bg-bizrent-navy/5" onClick={() => navigate('/landlord/notifications')}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:block w-px h-6 bg-border mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 flex items-center gap-2 pl-2 pr-4 rounded-full hover:bg-bizrent-navy/5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bizrent-navy text-white text-xs font-bold ring-2 ring-white shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium text-bizrent-slate hidden md:block">
                {user?.name?.split(' ')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1">
            <div className="px-3 py-2.5">
              <p className="text-sm font-bold text-bizrent-navy">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2" onClick={() => navigate('/landlord/settings')}>
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2 text-bizrent-red focus:text-bizrent-red focus:bg-bizrent-red/5" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}