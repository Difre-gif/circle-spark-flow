import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, CreditCard, Receipt, User, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Home', url: '/tenant', icon: Home },
  { title: 'Invoices', url: '/tenant/invoices', icon: FileText },
  { title: 'Payments', url: '/tenant/payments', icon: CreditCard },
  { title: 'Receipts', url: '/tenant/receipts', icon: Receipt },
  { title: 'Profile', url: '/tenant/profile', icon: User },
];

export function TenantLayout() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === '/tenant') return location.pathname === '/tenant';
    return location.pathname.startsWith(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
        <BizRentLogo variant="full" size="sm" className="text-bizrent-navy" />
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 hidden sm:flex" onClick={() => navigate('/super-admin')}>
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
          <Button variant="ghost" size="icon" onClick={async () => { await logout(); navigate('/login'); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 max-w-3xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom nav (mobile-first) */}
      <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t bg-card p-2">
        {navItems.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.url)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-md px-3 py-1.5 text-xs transition-colors',
              isActive(item.url) ? 'text-bizrent-navy font-bold' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
