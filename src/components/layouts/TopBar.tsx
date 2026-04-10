import { useEffect, useRef, useState } from 'react';
import { Bell, Search, LogOut, Menu, X } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const { data: notifications } = useNotifications();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
        } else {
          searchInputRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isMobileSearchOpen) {
    return (
      <header className="sticky top-0 z-20 flex h-20 items-center px-4 md:hidden bg-white/95 backdrop-blur-md border-b border-border/40 gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={mobileSearchInputRef}
            placeholder="Search properties, tenants..."
            className="pl-11 h-11 w-full rounded-full bg-muted/30 border-transparent shadow-sm focus-visible:ring-bizrent-blue/20 focus-visible:bg-white transition-all text-sm font-medium"
            autoFocus
          />
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 h-11 w-11 rounded-full" onClick={() => setIsMobileSearchOpen(false)}>
          <X className="h-5 w-5 text-muted-foreground" />
        </Button>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-border/40">
      {/* Left: Sidebar Toggle & Mobile Logo */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <SidebarTrigger className="h-10 w-10 rounded-xl bg-white border border-border/60 shadow-sm text-bizrent-navy hover:bg-slate-50 transition-all active:scale-95" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Toggle Sidebar (Cmd+B)</p>
          </TooltipContent>
        </Tooltip>
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
            ref={searchInputRef}
            placeholder="Search properties, tenants..." 
            className="pl-11 pr-16 h-11 rounded-full bg-muted/30 border-transparent shadow-sm focus-visible:ring-bizrent-blue/20 focus-visible:bg-white transition-all text-sm font-medium" 
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50 font-bold text-xxs tracking-widest uppercase">
            <kbd className="font-sans">⌘</kbd>K
          </div>
        </div>

        {/* Mobile Actions (Hidden on Desktop because Sidebar handles this) */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground" onClick={() => {
            setIsMobileSearchOpen(true);
            setTimeout(() => mobileSearchInputRef.current?.focus(), 50);
          }}>
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-white shadow-sm border border-border/50 text-bizrent-navy" onClick={() => navigate('/landlord/notifications')}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-bizrent-red text-xxxs font-bold text-white shadow-sm border border-white">
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