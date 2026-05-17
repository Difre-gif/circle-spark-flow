import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, CreditCard, Receipt, User, LogOut, Shield, Building2, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function TenantLayout() {
  const { user, logout, isSuperAdmin, userOrgs, orgId, switchOrg } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { title: t('nav.home'), url: '/tenant', icon: Home },
    { title: t('nav.myInvoices'), url: '/tenant/invoices', icon: FileText },
    { title: t('nav.myPayments'), url: '/tenant/payments', icon: CreditCard },
    { title: t('nav.myReceipts'), url: '/tenant/receipts', icon: Receipt },
    { title: t('nav.myProfile'), url: '/tenant/profile', icon: User },
  ];

  const isActive = (url: string) => {
    if (url === '/tenant') return location.pathname === '/tenant';
    return location.pathname.startsWith(url);
  };

  const tenantOrgs = userOrgs.filter(org => org.role === 'TENANT');
  const activeOrg = tenantOrgs.find(org => org.id === orgId) ?? tenantOrgs[0];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
        <BizRentLogo variant="full" size="sm" className="text-bizrent-navy dark:text-white" />
        <div className="flex items-center gap-2">
          {tenantOrgs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex h-9 max-w-[240px] items-center gap-2 rounded-xl px-3">
                  <Building2 className="h-4 w-4 text-bizrent-blue shrink-0" />
                  <span className="truncate text-sm font-semibold">{activeOrg?.name}</span>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px] rounded-2xl p-1.5">
                <DropdownMenuLabel className="text-xxs uppercase tracking-widest text-muted-foreground font-extrabold">
                  {t('legacy.organizations')}
                </DropdownMenuLabel>
                {tenantOrgs.map(org => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => {
                      if (org.id !== orgId) {
                        switchOrg(org.id);
                        navigate('/tenant');
                      }
                    }}
                    className={cn(
                      'cursor-pointer rounded-xl px-2.5 py-2.5',
                      org.id === orgId ? 'bg-muted/50 font-bold text-bizrent-navy dark:text-white' : 'text-muted-foreground'
                    )}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span className="truncate">{org.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isSuperAdmin && (
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 hidden sm:flex" onClick={() => navigate('/super-admin')}>
              <Shield className="h-4 w-4 mr-1" />
              {t('workspace.superAdminPortal')}
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
          <Button variant="ghost" size="icon" onClick={async () => { await logout(); navigate('/login'); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {tenantOrgs.length > 0 && (
        <div className="border-b bg-card px-4 py-3 sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between rounded-xl">
                <span className="flex min-w-0 items-center gap-2">
                  <Building2 className="h-4 w-4 text-bizrent-blue shrink-0" />
                  <span className="truncate font-semibold">{activeOrg?.name}</span>
                </span>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] rounded-2xl p-1.5">
              <DropdownMenuLabel className="text-xxs uppercase tracking-widest text-muted-foreground font-extrabold">
                {t('legacy.organizations')}
              </DropdownMenuLabel>
              {tenantOrgs.map(org => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => {
                    if (org.id !== orgId) {
                      switchOrg(org.id);
                      navigate('/tenant');
                    }
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl px-2.5 py-2.5',
                    org.id === orgId ? 'bg-muted/50 font-bold text-bizrent-navy dark:text-white' : 'text-muted-foreground'
                  )}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="truncate">{org.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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
              isActive(item.url) ? 'text-bizrent-navy dark:text-white font-bold' : 'text-muted-foreground'
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
