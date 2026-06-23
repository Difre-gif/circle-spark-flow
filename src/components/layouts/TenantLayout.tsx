import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BizRentLogo } from '@/components/BizRentLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, CreditCard, Receipt, User, LogOut, Shield, Building2, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function TenantLayout() {
  const { user, logout, isSuperAdmin, userOrgs, orgId, orgRole, switchOrg } = useAuth();
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

  const contextKey = (id: string, role?: string | null) => `${id}:${role ?? 'UNKNOWN'}`;
  const roleLabel = (role?: string) => {
    if (role === 'TENANT') return 'Tenant';
    if (role === 'OWNER') return 'Landlord';
    if (role === 'MANAGER') return 'Manager';
    if (role === 'ACCOUNTANT') return 'Accountant';
    return role ?? 'Workspace';
  };
  const activeContextKey = orgId ? contextKey(orgId, orgRole) : null;
  const activeOrg = userOrgs.find(org => contextKey(org.id, org.role) === activeContextKey) ?? userOrgs[0];
  const handleContextSwitch = (org: any) => {
    switchOrg(org.id, org.role);
    navigate(org.role === 'TENANT' ? '/tenant' : '/landlord');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
        <BizRentLogo variant="full" size="sm" className="text-bizrent-navy dark:text-white" />
        <div className="flex items-center gap-2">
          {userOrgs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden sm:flex h-9 max-w-[240px] items-center gap-2 rounded-xl px-3">
                  <Building2 className="h-4 w-4 text-bizrent-blue shrink-0" />
                  <span className="min-w-0 truncate text-sm font-semibold">{activeOrg?.name}</span>
                  <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xxs font-extrabold uppercase tracking-widest text-muted-foreground">
                    {roleLabel(activeOrg?.role)}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px] rounded-2xl p-1.5">
                <DropdownMenuLabel className="text-xxs uppercase tracking-widest text-muted-foreground font-extrabold">
                  Switch workspace
                </DropdownMenuLabel>
                {userOrgs.map(org => {
                  const isActiveContext = contextKey(org.id, org.role) === activeContextKey;
                  return (
                  <DropdownMenuItem
                    key={contextKey(org.id, org.role)}
                    onClick={() => {
                      if (!isActiveContext) {
                        handleContextSwitch(org);
                      }
                    }}
                    className={cn(
                      'cursor-pointer rounded-xl px-2.5 py-2.5',
                      isActiveContext ? 'bg-muted/50 font-bold text-bizrent-navy dark:text-white' : 'text-muted-foreground'
                    )}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    <span className="min-w-0 flex-1 truncate">{org.name}</span>
                    <span className="text-xxs font-extrabold uppercase tracking-widest opacity-60">{roleLabel(org.role)}</span>
                  </DropdownMenuItem>
                  );
                })}
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

      {userOrgs.length > 0 && (
        <div className="border-b bg-card px-4 py-3 sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between rounded-xl">
                <span className="flex min-w-0 items-center gap-2">
                  <Building2 className="h-4 w-4 text-bizrent-blue shrink-0" />
                  <span className="truncate font-semibold">{activeOrg?.name}</span>
                  <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xxs font-extrabold uppercase tracking-widest text-muted-foreground">
                    {roleLabel(activeOrg?.role)}
                  </span>
                </span>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] rounded-2xl p-1.5">
              <DropdownMenuLabel className="text-xxs uppercase tracking-widest text-muted-foreground font-extrabold">
                Switch workspace
              </DropdownMenuLabel>
              {userOrgs.map(org => {
                const isActiveContext = contextKey(org.id, org.role) === activeContextKey;
                return (
                <DropdownMenuItem
                  key={contextKey(org.id, org.role)}
                  onClick={() => {
                    if (!isActiveContext) {
                      handleContextSwitch(org);
                    }
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl px-2.5 py-2.5',
                    isActiveContext ? 'bg-muted/50 font-bold text-bizrent-navy dark:text-white' : 'text-muted-foreground'
                  )}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="min-w-0 flex-1 truncate">{org.name}</span>
                  <span className="text-xxs font-extrabold uppercase tracking-widest opacity-60">{roleLabel(org.role)}</span>
                </DropdownMenuItem>
                );
              })}
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
