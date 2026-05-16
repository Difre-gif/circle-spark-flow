import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CalendarClock, BellRing, UploadCloud, Shield, UserPlus, AlertTriangle, ChevronRight, RotateCcw, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganisation, useUpdateOrganisation, useNotificationPrefs, useUpdateNotificationPrefs, useTeamMembers, formatDate } from '@/hooks/useSupabaseData';
import { InviteStaffModal } from '@/components/layouts/InviteStaffModal';
import { toast } from 'sonner';
import { DEFAULT_POLICY_FORM, getPolicyErrors, normalizeDays, samePolicy, type PolicyForm } from '@/lib/policies';

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: org, isLoading: orgLoading } = useOrganisation();
  const updateOrg = useUpdateOrganisation();
  const { data: notifPrefs } = useNotificationPrefs();
  const updateNotifPrefs = useUpdateNotificationPrefs();
  const { data: teamMembers } = useTeamMembers();

  const [form, setForm] = useState<{ name: string; email: string; phone: string; timezone: string } | null>(null);
  const [settingsForm, setSettingsForm] = useState<PolicyForm | null>(null);
  const [savedPolicy, setSavedPolicy] = useState<PolicyForm | null>(null);
  const [customBeforeDay, setCustomBeforeDay] = useState('');
  const [customAfterDay, setCustomAfterDay] = useState('');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Sync form state from org data (runs on first load and after successful save)
  useEffect(() => {
    if (!org) return;
    const dbSettings = org.settings as any;
    const nextPolicy = {
      default_due_day: dbSettings?.billing?.default_due_day ?? DEFAULT_POLICY_FORM.default_due_day,
      default_invoice_lead_days: dbSettings?.billing?.default_invoice_lead_days ?? DEFAULT_POLICY_FORM.default_invoice_lead_days,
      grace_period_days: dbSettings?.billing?.grace_period_days ?? DEFAULT_POLICY_FORM.grace_period_days,
      days_before_due: normalizeDays(dbSettings?.reminders?.days_before_due ?? DEFAULT_POLICY_FORM.days_before_due),
      days_after_due: normalizeDays(dbSettings?.reminders?.days_after_due ?? DEFAULT_POLICY_FORM.days_after_due),
    };
    setSettingsForm(nextPolicy);
    setSavedPolicy(nextPolicy);
    setForm({
      name: org.name ?? '',
      email: org.email ?? '',
      phone: org.phone ?? '',
      timezone: (org as any).timezone ?? 'Africa/Kigali'
    });
  }, [org]);

  const handleSaveProfile = () => {
    if (!form) return;
    if (!form.name.trim()) {
      toast.error('Organisation name is required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error('Enter a valid support email address.');
      return;
    }
    updateOrg.mutate({ name: form.name, email: form.email, phone: form.phone, timezone: form.timezone });
  };

  const policyErrors = useMemo(() => getPolicyErrors(settingsForm), [settingsForm]);

  const hasUnsavedPolicyChanges = !samePolicy(settingsForm, savedPolicy);

  const handleSavePolicies = async () => {
    if (!settingsForm) return;
    if (policyErrors.length > 0) {
      toast.error(policyErrors[0]);
      return;
    }

    const currentSettings = (org?.settings as any) || {};
    const newSettings = {
      ...currentSettings,
      billing: {
        ...currentSettings.billing,
        default_due_day: settingsForm.default_due_day,
        default_invoice_lead_days: settingsForm.default_invoice_lead_days,
        grace_period_days: settingsForm.grace_period_days
      },
      reminders: {
        ...currentSettings.reminders,
        days_before_due: normalizeDays(settingsForm.days_before_due),
        days_after_due: normalizeDays(settingsForm.days_after_due)
      }
    };

    try {
      await updateOrg.mutateAsync({ settings: newSettings } as any);
    } catch {
      // useUpdateOrganisation already surfaces the database error via toast.
    }
  };

  const toggleDay = (array: number[], day: number, type: 'before' | 'after') => {
    const newArray = array.includes(day) ? array.filter(d => d !== day) : [...array, day].sort((a, b) => a - b);
    setSettingsForm(prev => prev ? { ...prev, [type === 'before' ? 'days_before_due' : 'days_after_due']: newArray } : null);
  };

  const addCustomDay = (type: 'before' | 'after') => {
    if (!settingsForm) return;
    const rawValue = type === 'before' ? customBeforeDay : customAfterDay;
    const day = Number(rawValue);
    const max = type === 'before' ? 30 : 90;
    if (!Number.isInteger(day) || day < 1 || day > max) {
      toast.error(`Choose a whole number between 1 and ${max}.`);
      return;
    }
    const key = type === 'before' ? 'days_before_due' : 'days_after_due';
    setSettingsForm({ ...settingsForm, [key]: normalizeDays([...settingsForm[key], day]) });
    if (type === 'before') setCustomBeforeDay('');
    else setCustomAfterDay('');
  };

  const removeDay = (type: 'before' | 'after', day: number) => {
    if (!settingsForm) return;
    const key = type === 'before' ? 'days_before_due' : 'days_after_due';
    setSettingsForm({ ...settingsForm, [key]: settingsForm[key].filter(value => value !== day) });
  };

  const resetPolicies = () => setSettingsForm(DEFAULT_POLICY_FORM);

  const [activeTab, setActiveTab] = useState('organisation');

  if (orgLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy dark:text-white" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-12">
      <div className="page-header">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="text-muted-foreground">{t('legacy.settings')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue capitalize">{activeTab}</span>
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-bizrent-navy dark:text-white mt-1">{t('legacy.organisationSettings')}</h1>
          <p className="text-base font-medium text-muted-foreground mt-2">{t('legacy.manageYourWorkspaceBillingRulesAndStaff')}</p>
        </div>
      </div>

      <Tabs defaultValue="organisation" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/80 p-1 rounded-xl h-auto mb-6 inline-flex overflow-x-auto max-w-full no-scrollbar">
          <TabsTrigger value="organisation" className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-card data-[state=active]:text-bizrent-navy dark:text-white data-[state=active]:shadow-sm">{t('legacy.organisation')}</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-card data-[state=active]:text-bizrent-navy dark:text-white data-[state=active]:shadow-sm">{t('legacy.team')}</TabsTrigger>
          <TabsTrigger value="policies" className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-card data-[state=active]:text-bizrent-navy dark:text-white data-[state=active]:shadow-sm">{t('legacy.policies')}</TabsTrigger>
          <TabsTrigger value="billing" onClick={() => navigate('/landlord/billing')} className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-card data-[state=active]:text-bizrent-navy dark:text-white data-[state=active]:shadow-sm">{t('legacy.billing')}</TabsTrigger>
        </TabsList>

        <TabsContent value="organisation" className="space-y-6 mt-0">
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-card overflow-hidden">
            <CardHeader className="bg-card border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white">{t('legacy.organisationProfile')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <div className="flex items-center gap-6 mb-8 opacity-80">
                <div className="h-20 w-20 rounded-2xl bg-muted/40 border-2 border-dashed border-border flex items-center justify-center text-muted-foreground group cursor-pointer hover:border-bizrent-blue hover:text-bizrent-blue transition-colors">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-bizrent-navy dark:text-white">{t('legacy.organisationLogo')}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1 mb-2">{t('legacy.recommendedSize256X256PxMax2Mb')}</p>
                  <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs h-8" disabled>{t('legacy.uploadComingSoon')}</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80">{t('legacy.organisationName')}</Label>
                  <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" value={form?.name || ''} onChange={e => setForm(prev => prev ? { ...prev, name: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80">{t('legacy.supportEmail')}</Label>
                  <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" value={form?.email || ''} onChange={e => setForm(prev => prev ? { ...prev, email: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80">{t('legacy.supportPhone')}</Label>
                  <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" placeholder="+250 7XX XXX XXX" value={form?.phone || ''} onChange={e => setForm(prev => prev ? { ...prev, phone: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80">{t('legacy.timezone')}</Label>
                  <Select value={form?.timezone} onValueChange={v => setForm(prev => prev ? { ...prev, timezone: v } : null)}>
                    <SelectTrigger className="h-10 rounded-xl border-border/60 focus:ring-bizrent-blue/20">
                      <SelectValue placeholder="Select Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kigali">Africa/Kigali (CAT)</SelectItem>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="Africa/Dar_es_Salaam">Africa/Dar es Salaam (EAT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80">{t('legacy.country')}</Label>
                  <Select value={(org as any)?.country_code ?? 'RW'} disabled>
                    <SelectTrigger className="h-10 rounded-xl bg-muted/30 focus:ring-0 cursor-not-allowed text-muted-foreground font-medium">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RW">Rwanda (RW)</SelectItem>
                      <SelectItem value="KE">Kenya (KE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90" onClick={handleSaveProfile} disabled={updateOrg.isPending}>
                {updateOrg.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-red-100 rounded-[1.5rem] shadow-sm bg-red-50/30 overflow-hidden">
            <CardHeader className="border-b border-red-100 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> {t('legacy.dangerZone')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy dark:text-white">{t('legacy.deactivateOrganisation')}</p>
                  <p className="text-[12px] font-medium text-muted-foreground mt-0.5 max-w-lg">
                    {t('legacy.thisWillImmediatelyHideYourPortfolioDisableAllStaffAccountsUnderThisWo')}
                  </p>
                </div>
                <Button variant="destructive" className="rounded-xl font-bold px-6" disabled>{t('legacy.contactSupportToDeactivate')}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-0">
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-card overflow-hidden">
            <CardHeader className="bg-card border-b border-border/40 pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white">{t('legacy.teamMembers')}</CardTitle>
              <Button onClick={() => setIsInviteModalOpen(true)} className="bg-bizrent-navy hover:bg-bizrent-navy/90 rounded-lg h-9 text-xs font-bold px-4 gap-2">
                <UserPlus className="h-3.5 w-3.5" /> {t('legacy.inviteStaff')}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <InviteStaffModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground border-b border-border/40">
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">{t('legacy.name')}</th>
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">{t('legacy.email')}</th>
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">{t('legacy.role')}</th>
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">{t('legacy.joined')}</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:nth-child(even)]:bg-bizrent-light">
                    {(teamMembers ?? []).map(m => (
                      <tr key={m.id} className="transition-colors hover:bg-muted/40 border-b border-border/20">
                        <td className="px-6 py-4 font-bold text-bizrent-navy dark:text-white">{(m.user as any)?.full_name ?? '—'}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm font-medium">{(m.user as any)?.email ?? '—'}</td>
                        <td className="px-6 py-4"><StatusBadge status={m.role} /></td>
                        <td className="px-6 py-4 text-muted-foreground text-[12px] font-semibold">{formatDate(m.created_at)}</td>
                      </tr>
                    ))}
                    {(!teamMembers || teamMembers.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">
                          {t('legacy.noTeamMembersFound')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] bg-card overflow-hidden">
            <CardHeader className="bg-muted/40 border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-bizrent-navy dark:text-white flex items-center gap-2"><Shield className="h-4 w-4 text-bizrent-blue"/> {t('legacy.rolePermissionsGuide')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="font-extrabold text-bizrent-navy dark:text-white text-sm uppercase tracking-wider">{t('legacy.owner')}</span>
                  <p className="text-[12px] text-muted-foreground font-medium">{t('legacy.fullAccessToManagePropertiesBillingPoliciesAndTeamMembers')}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-bizrent-blue text-sm uppercase tracking-wider">{t('legacy.manager')}</span>
                  <p className="text-[12px] text-muted-foreground font-medium">{t('legacy.canAddUnitsInviteTenantsAndApproveRejectMomoPayments')}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-emerald-600 text-sm uppercase tracking-wider">{t('legacy.accountant')}</span>
                  <p className="text-[12px] text-muted-foreground font-medium">{t('legacy.viewOnlyPropertiesFullAccessToManageInvoicesReceiptsReports')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6 mt-0">
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-card overflow-hidden">
            <CardHeader className="bg-card border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-bizrent-blue" />
                {t('legacy.billingReminderPolicy')}
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium mt-1 text-[13px]">
                {t('legacy.configureHowTheSystemHandlesAutomatedInvoicingGracePeriodsAndOverdueEs')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6 px-6">
              {settingsForm && (
                <>
                {/* Timeline Visualization */}
                <div className="bg-muted/40 p-6 rounded-2xl border border-border">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-3">
                    <span className="text-bizrent-blue">{t('legacy.invoiceSent')}</span>
                    <span className="text-bizrent-navy dark:text-white">{t('legacy.dueDate')}</span>
                    <span className="text-red-500">{t('legacy.overdue')}</span>
                  </div>
                  <div className="relative h-2 bg-slate-200 rounded-full w-full flex items-center">
                    <div className="absolute left-0 h-2 bg-bizrent-blue/40 rounded-l-full" style={{width: '30%'}}></div>
                    <div className="absolute left-[30%] h-2 bg-bizrent-amber/50" style={{width: '20%'}}></div>
                    <div className="absolute left-[50%] h-2 bg-red-500/50 rounded-r-full" style={{width: '50%'}}></div>

                    {/* Markers */}
                    <div className="absolute left-[30%] -ml-1 h-4 w-2 bg-bizrent-navy rounded-full shadow-sm z-10"></div>
                  </div>
                  <div className="flex justify-between mt-3 text-[12px] text-muted-foreground font-medium">
                    <span>-{settingsForm.default_invoice_lead_days} Days</span>
                    <span className="ml-12 font-bold text-bizrent-navy dark:text-white">Day {settingsForm.default_due_day}</span>
                    <span>+{settingsForm.grace_period_days} Days (Grace)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80">{t('legacy.defaultBillingDay')}</Label>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">{t('legacy.day')}</span>
                        <Input
                          type="number"
                          min="1"
                          max="28"
                          className="w-20 h-10 rounded-xl font-bold text-center border-border/60 focus-visible:ring-bizrent-blue/20"
                          value={settingsForm.default_due_day}
                          onChange={e => setSettingsForm({ ...settingsForm, default_due_day: e.target.value === '' ? 0 : Number(e.target.value) })}
                        />
                        <span className="text-sm font-medium text-muted-foreground">{t('legacy.ofTheMonth')}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground font-medium mt-1 leading-relaxed">
                        {t('legacy.defaultBillingDayHelp')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80">{t('legacy.defaultInvoiceSendTiming')}</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          className="w-20 h-10 rounded-xl font-bold text-center border-border/60 focus-visible:ring-bizrent-blue/20"
                          value={settingsForm.default_invoice_lead_days}
                          onChange={e => setSettingsForm({ ...settingsForm, default_invoice_lead_days: e.target.value === '' ? -1 : Number(e.target.value) })}
                        />
                        <span className="text-sm font-medium text-muted-foreground">{t('legacy.daysBeforeDueDate')}</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground font-medium mt-1 leading-relaxed">
                        {t('legacy.defaultInvoiceSendTimingHelp')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80 flex items-center gap-2">
                        {t('legacy.gracePeriod')} <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-widest font-black text-[10px]">{t('legacy.important')}</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          className="w-20 h-10 rounded-xl font-bold text-center border-border/60 focus-visible:ring-bizrent-blue/20"
                          value={settingsForm.grace_period_days}
                          onChange={e => setSettingsForm({ ...settingsForm, grace_period_days: e.target.value === '' ? -1 : Number(e.target.value) })}
                        />
                        <span className="text-sm font-medium text-muted-foreground">{t('legacy.daysAfterDueDate')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80 flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-bizrent-blue" />
                        {t('legacy.preDueReminders')}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[7, 5, 3, 2, 1].map(day => (
                          <button
                            key={day}
                            onClick={() => toggleDay(settingsForm.days_before_due, day, 'before')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              settingsForm.days_before_due.includes(day)
                                ? 'bg-bizrent-navy text-white shadow-md shadow-bizrent-navy/20'
                                : 'bg-muted text-muted-foreground hover:bg-slate-200'
                            }`}
                          >
                            {day} Days Before
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {settingsForm.days_before_due.map(day => (
                          <span key={`before-${day}`} className="inline-flex items-center gap-1 rounded-full bg-bizrent-navy/10 px-2.5 py-1 text-xs font-bold text-bizrent-navy dark:text-white">
                            {day} days
                            <button type="button" onClick={() => removeDay('before', day)} aria-label={`Remove ${day} day pre-due reminder`}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          value={customBeforeDay}
                          onChange={e => setCustomBeforeDay(e.target.value)}
                          placeholder="Custom day"
                          className="h-9 w-28 rounded-xl"
                        />
                        <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => addCustomDay('before')}>
                          <Plus className="mr-1 h-3.5 w-3.5" /> {t('legacy.add')}
                        </Button>
                      </div>
                      <p className="text-[12px] text-muted-foreground font-medium mt-2 leading-relaxed">
                        {t('legacy.automatedEmailRemindersToTenantsBeforeTheDueDateLeaveEmptyToDisablePre')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-foreground/80 flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-red-500" />
                        {t('legacy.overdueEscalations')}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 3, 5, 7, 10, 14, 30].map(day => (
                          <button
                            key={day}
                            onClick={() => toggleDay(settingsForm.days_after_due, day, 'after')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              settingsForm.days_after_due.includes(day)
                                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                : 'bg-red-50 text-red-400 hover:bg-red-100'
                            }`}
                          >
                            +{day} Days Late
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {settingsForm.days_after_due.map(day => (
                          <span key={`after-${day}`} className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600">
                            +{day} days
                            <button type="button" onClick={() => removeDay('after', day)} aria-label={`Remove ${day} day overdue escalation`}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="90"
                          value={customAfterDay}
                          onChange={e => setCustomAfterDay(e.target.value)}
                          placeholder="Custom day"
                          className="h-9 w-28 rounded-xl"
                        />
                        <Button type="button" variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => addCustomDay('after')}>
                          <Plus className="mr-1 h-3.5 w-3.5" /> {t('legacy.add')}
                        </Button>
                      </div>
                      <p className="text-[12px] text-muted-foreground font-medium mt-2 leading-relaxed">
                        {t('legacy.escalatingNoticesSentAutomaticallyToOverdueTenantsLeaveEmptyToDisableO')}
                      </p>
                    </div>
                  </div>
                </div>
                </>
              )}

              {policyErrors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {policyErrors[0]}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90"
                  onClick={handleSavePolicies}
                  disabled={updateOrg.isPending || !hasUnsavedPolicyChanges || policyErrors.length > 0}
                >
                  {updateOrg.isPending ? 'Saving...' : hasUnsavedPolicyChanges ? 'Save Policies' : 'Policies Saved'}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl font-semibold" onClick={resetPolicies} disabled={updateOrg.isPending}>
                  <RotateCcw className="mr-2 h-4 w-4" /> {t('legacy.resetToDefaults')}
                </Button>
                {hasUnsavedPolicyChanges && <span className="text-xs font-bold text-amber-700">{t('legacy.unsavedChanges')}</span>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-card overflow-hidden">
            <CardHeader className="bg-card border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white">{t('legacy.myNotificationPreferences')}</CardTitle>
              <CardDescription className="text-[12px] font-medium">{t('legacy.theseSwitchesArePersonalToYourAccountNotOrganisationWidePolicy')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6 px-6 pb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy dark:text-white">{t('legacy.paymentSubmissions')}</p>
                  <p className="text-[12px] font-medium text-muted-foreground mt-0.5">{t('legacy.notifyManagersWhenTenantsSubmitMomoProof')}</p>
                </div>
                <Switch checked={notifPrefs?.payment_submissions ?? true} onCheckedChange={v => { updateNotifPrefs.mutate({ payment_submissions: v }); toast.success("Saved"); }} disabled={updateNotifPrefs.isPending} />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy dark:text-white">{t('legacy.overdueInvoices')}</p>
                  <p className="text-[12px] font-medium text-muted-foreground mt-0.5">{t('legacy.alertWhenGracePeriodExpires')}</p>
                </div>
                <Switch checked={notifPrefs?.overdue_invoices ?? true} onCheckedChange={v => { updateNotifPrefs.mutate({ overdue_invoices: v }); toast.success("Saved"); }} disabled={updateNotifPrefs.isPending} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-8 pb-4">
        <p className="text-xs font-medium text-muted-foreground flex flex-col sm:flex-row items-center gap-1.5 opacity-80">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 256-bit SSL encryption</span>
          <span className="hidden sm:inline">•</span>
          <span>{t('legacy.dataSecuredBySupabase')}</span>
        </p>
      </div>
    </div>
  );
}
