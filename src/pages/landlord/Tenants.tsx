import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Loader2, Search, UserPlus, Mail, Clock, Send, Activity, Trash2, RotateCw, ChevronRight, MoreVertical, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenants, useInvitations, formatDate, useResendInvitation, useCancelInvitation, useUpdateTenantProfile, useRemoveTenant, useUnits, useCreateTenancy } from '@/hooks/useSupabaseData';
import { InviteTenantDialog } from '@/components/tenants/InviteTenantDialog';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCyclePreview } from '@/lib/billingCycles';

export default function Tenants() {
  const { t } = useTranslation();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: tenants, isLoading } = useTenants();
  const { data: invitations, isLoading: invLoading } = useInvitations();
  const { data: units } = useUnits();
  const [search, setSearch] = useState('');
  const resendInvite = useResendInvitation();
  const cancelInvite = useCancelInvitation();
  const removeTenant = useRemoveTenant();
  const updateTenant = useUpdateTenantProfile();
  const createTenancy = useCreateTenancy();
  
  const [deleteTenantTarget, setDeleteTenantTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTenantTarget, setEditTenantTarget] = useState<{ 
    id: string; 
    name: string; 
    phone: string; 
    unit_id?: string; 
    rent?: number;
    start_date?: string;
    billing_frequency?: 'WEEKLY' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
    period_anchor_day?: number;
    security_deposit_total?: number;
  } | null>(null);

  const availableUnits = (units ?? []).filter(u => u.status === 'VACANT');

  const filtered = (tenants ?? []).filter(tenant => {
    const user = tenant.user as any;
    return user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
           user?.email?.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy dark:text-white" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy dark:text-white transition-colors">{t('legacy.management')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">{t('legacy.tenantsDirectory')}</span>
          </p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy dark:text-white tracking-tight">{t('legacy.tenantsDirectory')}</h1>
          <p className="page-description font-medium text-muted-foreground">
            {tenants?.length === 0
              ? t('legacy.noTenantsYetAddSomeoneToYourWorkspace')
              : t('legacy.manageYourActiveTenants', { count: tenants?.length ?? 0 })}
          </p>
        </div>
        <Button 
          onClick={() => setInviteOpen(true)}
          className="rounded-xl bg-bizrent-navy hover:bg-bizrent-navy/90 text-white font-bold h-12 px-6 shadow-lg shadow-bizrent-navy/10 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          {t('legacy.inviteNewTenant')}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main List */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center max-w-sm relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-bizrent-blue" />
            <Input 
              placeholder={t('legacy.searchByNameOrEmail')}
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-11 h-11 rounded-xl bg-card border-border/50 shadow-sm focus-visible:ring-bizrent-blue/20/20 text-sm font-medium transition-all" 
            />
          </div>

          <Card className="overflow-hidden border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-border/20 bg-muted/20 text-muted-foreground font-bold uppercase text-xxs tracking-widest">
                      <th className="text-left px-8 py-4 whitespace-nowrap">{t('legacy.name')}</th>
                      <th className="text-left px-4 py-4">{t('legacy.contactInfo')}</th>
                      <th className="text-left px-8 py-4">{t('legacy.joinedDate')}</th>
                      <th className="text-right px-8 py-4">{t('legacy.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:nth-child(even)]:bg-muted/40">
                    {filtered.map(tenant => {
                      const user = tenant.user as any;
                      return (
                        <tr key={tenant.user_id} className="transition-all hover:bg-card border-b border-border/10 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-bizrent-blue/10 text-bizrent-blue flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-all">
                                {user?.full_name?.charAt(0) || 'U'}
                              </div>
                              <span className="font-extrabold text-bizrent-navy dark:text-white">{user?.full_name ?? '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground font-semibold text-xs">{user?.email ?? '—'}</span>
                              <span className="text-xs font-bold text-bizrent-slate">{user?.phone ?? '—'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-muted-foreground text-xs font-bold">{formatDate(tenant.created_at)}</td>
                          <td className="px-8 py-5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-border/40">
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer py-2 px-3 font-medium rounded-lg hover:bg-muted/40 hover:text-bizrent-blue transition-colors"
                                  onClick={() => setEditTenantTarget({ id: user?.id, name: user?.full_name || '', phone: user?.phone || '' })}
                                >
                                  <Edit2 className="h-4 w-4" /> {t('legacy.editProfile')}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer py-2 px-3 text-bizrent-red font-medium rounded-lg hover:bg-red-50 hover:text-bizrent-red transition-colors"
                                  onClick={() => setDeleteTenantTarget({ id: user?.id, name: user?.full_name })}
                                >
                                  <Trash2 className="h-4 w-4" /> {t('legacy.remove')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <Activity className="h-10 w-10 mb-2 opacity-10" />
                            <p className="font-bold text-bizrent-navy dark:text-white">{t('legacy.noActiveTenantsFound')}</p>
                            <p className="text-xs font-medium mt-1">{t('legacy.tryAdjustingYourSearchCriteria')}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Pending Invitations */}
        <div className="xl:col-span-4">
          <Card className="border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card sticky top-6 overflow-hidden">
            <CardHeader className="pt-7 px-8 pb-4">
              <CardTitle className="text-lg font-extrabold text-bizrent-navy dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#F59E0B]" />
                {t('legacy.pendingInvites')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-2">
              <div className="space-y-4">
                {invLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-12" /></div>
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))
                ) : (
                  <>
                    {(invitations ?? []).map(inv => (
                      <div key={inv.id} className="p-4 rounded-2xl border border-border/50 bg-muted/30 space-y-2 group hover:border-[#F59E0B]/50 transition-all relative">
                        <div className="flex justify-between items-start pr-12">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-bold text-bizrent-navy dark:text-white truncate max-w-[140px] cursor-help">{inv.email}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{inv.email}</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-xxxs font-extrabold bg-[#F59E0B]/20 text-[#92400E] px-2 py-0.5 rounded-full uppercase tracking-tighter">{t('legacy.sent')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xxs font-semibold text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {t('legacy.invitedOn', { date: formatDate(inv.created_at) })}
                        </div>
                        <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-bizrent-blue/10 hover:text-bizrent-blue" onClick={() => resendInvite.mutate(inv)}>
                                <RotateCw className={cn("h-3 w-3", resendInvite.isPending && resendInvite.variables?.id === inv.id ? "animate-spin" : "")} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p className="text-xs">{t('legacy.resendInvite')}</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600" onClick={() => cancelInvite.mutate(inv.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p className="text-xs">{t('legacy.cancelInvite')}</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                    {(invitations ?? []).length === 0 && (
                      <div className="text-center py-10 px-4 border-2 border-dashed border-muted rounded-[2rem] bg-muted/40">
                        <p className="text-xs font-bold text-muted-foreground/60 italic leading-relaxed">{t('legacy.yourInvitationList')} <br/> {t('legacy.isCurrentlyEmpty')}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InviteTenantDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <Dialog open={!!deleteTenantTarget} onOpenChange={open => { if (!open) setDeleteTenantTarget(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-bizrent-navy dark:text-white">{t('legacy.removeTenant')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium">
              {t('legacy.areYouSureYouWantToRemove')} <strong>{deleteTenantTarget?.name}</strong> {t('legacy.fromYourWorkspaceTheyWillNoLongerBeAbleToSubmitPaymentsOrViewInvoicesF')}
            </DialogDescription>
          </div>
          <DialogFooter className="gap-2 mt-8 sm:justify-center w-full flex-col sm:flex-row">
            <Button variant="outline" className="rounded-xl font-bold h-11 sm:flex-1" onClick={() => setDeleteTenantTarget(null)}>
              {t('legacy.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl font-bold h-11 sm:flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
              onClick={async () => {
                if (deleteTenantTarget) {
                  await removeTenant.mutateAsync(deleteTenantTarget.id);
                  setDeleteTenantTarget(null);
                }
              }}
              disabled={removeTenant.isPending}
            >
              {removeTenant.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {removeTenant.isPending ? t('legacy.removing') : t('legacy.removeTenant')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTenantTarget} onOpenChange={open => { if (!open) setEditTenantTarget(null); }}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-bizrent-navy dark:text-white">{t('legacy.editTenantProfile')}</DialogTitle>
            <DialogDescription className="font-medium text-sm mt-1 text-muted-foreground">
              {t('legacy.updateTheContactDetailsForThisTenant')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-5">
            <div className="space-y-2">
              <Label className="font-bold text-bizrent-navy dark:text-white px-1 text-xs uppercase tracking-widest opacity-70">{t('legacy.personalInfo')}</Label>
              <div className="space-y-4 p-4 bg-bizrent-light rounded-2xl border border-border">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t('legacy.fullName')}</Label>
                  <Input 
                    placeholder="John Doe" 
                    className="rounded-xl h-11 border-border/60 bg-card focus-visible:ring-bizrent-blue/20"
                    value={editTenantTarget?.name || ''}
                    onChange={e => setEditTenantTarget(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t('legacy.phoneNumber')}</Label>
                  <Input 
                    placeholder="+250 7XX XXX XXX" 
                    className="rounded-xl h-11 border-border/60 bg-card focus-visible:ring-bizrent-blue/20"
                    value={editTenantTarget?.phone || ''}
                    onChange={e => setEditTenantTarget(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-bizrent-navy dark:text-white px-1 text-xs uppercase tracking-widest opacity-70">{t('legacy.unitAssignment')}</Label>
              <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t('legacy.moveIntoUnit')}</Label>
                  <Select 
                    value={editTenantTarget?.unit_id || "none"} 
                    onValueChange={val => {
                      const unit = units?.find(u => u.id === val);
                      setEditTenantTarget(prev => prev ? { ...prev, unit_id: val === "none" ? undefined : val, rent: unit?.monthly_rent } : null);
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-card border-border/60">
                      <SelectValue placeholder="Select a vacant unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none" className="text-muted-foreground font-medium">{t('legacy.noUnitAssigned')}</SelectItem>
                      {availableUnits.map(u => (
                        <SelectItem key={u.id} value={u.id} className="font-bold">
                          {u.properties?.name} — {u.unit_number} ({u.unit_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xxs font-semibold text-muted-foreground mt-1 ml-1">
                    {t('legacy.onlyVacantUnitsAreShownHere')}
                  </p>
                </div>

                {editTenantTarget?.unit_id && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground ml-1">{t('legacy.agreedMonthlyRentRwf')}</Label>
                      <Input 
                        type="number"
                        placeholder="Agreed rent" 
                        className="rounded-xl h-11 border-border/60 bg-card focus-visible:ring-bizrent-blue/20 font-bold"
                        value={editTenantTarget?.rent || ''}
                        onChange={e => setEditTenantTarget(prev => prev ? { ...prev, rent: Number(e.target.value) } : null)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">{t('legacy.securityDeposit')}</Label>
                        <Input 
                          type="number"
                          placeholder="e.g. 50000" 
                          className="rounded-xl h-11 border-border/60 bg-card focus-visible:ring-bizrent-blue/20 font-bold"
                          value={editTenantTarget?.security_deposit_total || ''}
                          onChange={e => setEditTenantTarget(prev => prev ? { ...prev, security_deposit_total: Number(e.target.value) } : null)}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-muted-foreground ml-1">{t('legacy.billingFreq')}</Label>
                        <Select 
                          value={editTenantTarget?.billing_frequency || 'MONTHLY'} 
                          onValueChange={val => setEditTenantTarget(prev => prev ? { ...prev, billing_frequency: val as any } : null)}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-card border-border/60 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="WEEKLY" className="font-bold">{t('legacy.weekly')}</SelectItem>
                            <SelectItem value="MONTHLY" className="font-bold">{t('legacy.monthly')}</SelectItem>
                            <SelectItem value="QUARTERLY" className="font-bold">{t('legacy.quarterly')}</SelectItem>
                            <SelectItem value="ANNUAL" className="font-bold">{t('legacy.annual')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground ml-1">{t('legacy.moveInTenancyStartDate')}</Label>
                      <Input
                        type="date"
                        className="rounded-xl h-11 border-border/60 bg-card focus-visible:ring-bizrent-blue/20 font-bold"
                        value={editTenantTarget?.start_date || new Date().toISOString().split('T')[0]}
                        onChange={e => setEditTenantTarget(prev => prev ? {
                          ...prev,
                          start_date: e.target.value,
                          period_anchor_day: prev.period_anchor_day || (e.target.value ? new Date(`${e.target.value}T12:00:00`).getDate() : undefined),
                        } : null)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground ml-1 flex items-center justify-between">
                        <span>{t('legacy.rentCycleStartsOnDay')}</span>
                        <span className="text-xxxs uppercase tracking-widest text-bizrent-blue bg-bizrent-blue/10 px-2 py-0.5 rounded-full">{t('legacy.override')}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground">{t('legacy.day')}</span>
                        <Input 
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1" 
                          className="rounded-xl h-11 border-border/60 bg-card focus-visible:ring-bizrent-blue/20 font-bold w-20 text-center"
                          value={editTenantTarget?.period_anchor_day || ''}
                          onChange={e => setEditTenantTarget(prev => prev ? { ...prev, period_anchor_day: Number(e.target.value) } : null)}
                        />
                        <span className="text-xs font-medium text-muted-foreground">{t('legacy.ofTheMonth')}</span>
                      </div>
                      <p className="text-xxs text-muted-foreground leading-tight ml-1 mt-1">{t('legacy.theCycleEndIsDerivedAsTheDayBeforeTheNextCycleStarts')}</p>
                      {editTenantTarget?.start_date && editTenantTarget?.period_anchor_day && getCyclePreview(editTenantTarget.start_date, editTenantTarget.period_anchor_day) && (
                        <p className="text-xs font-bold text-bizrent-blue ml-1 mt-2">
                          {t('legacy.firstCycle', { label: getCyclePreview(editTenantTarget.start_date, editTenantTarget.period_anchor_day)?.label })}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditTenantTarget(null)}>{t('legacy.cancel')}</Button>
            <Button 
              className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-bizrent-navy/10"
              onClick={async () => {
                if (editTenantTarget) {
                  // 1. Update basic profile
                  await updateTenant.mutateAsync({ 
                    user_id: editTenantTarget.id, 
                    full_name: editTenantTarget.name, 
                    phone: editTenantTarget.phone 
                  });
                  
                  // 2. If a unit was selected, create a tenancy
                  if (editTenantTarget.unit_id && editTenantTarget.rent) {
                    await createTenancy.mutateAsync({
                      tenant_user_id: editTenantTarget.id,
                      unit_id: editTenantTarget.unit_id,
                      agreed_rent: editTenantTarget.rent,
                      start_date: editTenantTarget.start_date || new Date().toISOString().split('T')[0],
                      deposit_amount: editTenantTarget.security_deposit_total || 0,
                      security_deposit_total: editTenantTarget.security_deposit_total,
                      billing_frequency: editTenantTarget.billing_frequency || 'MONTHLY',
                      period_anchor_day: editTenantTarget.period_anchor_day,
                    });
                  }
                  
                  setEditTenantTarget(null);
                }
              }}
              disabled={updateTenant.isPending || createTenancy.isPending || !editTenantTarget?.name.trim()}
            >
              {(updateTenant.isPending || createTenancy.isPending) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {(updateTenant.isPending || createTenancy.isPending) ? t('legacy.updating') : t('legacy.saveProfile')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
