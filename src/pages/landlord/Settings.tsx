import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CalendarClock, BellRing, UploadCloud, Users, Shield, UserPlus, AlertTriangle, ChevronRight } from 'lucide-react';
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

export default function Settings() {
  const navigate = useNavigate();
  const { data: org, isLoading: orgLoading } = useOrganisation();
  const updateOrg = useUpdateOrganisation();
  const { data: notifPrefs } = useNotificationPrefs();
  const updateNotifPrefs = useUpdateNotificationPrefs();
  const { data: teamMembers } = useTeamMembers();

  const [form, setForm] = useState<{ name: string; email: string; phone: string; timezone: string } | null>(null);
  const [settingsForm, setSettingsForm] = useState<{
    default_due_day: number;
    grace_period_days: number;
    days_before_due: number[];
    days_after_due: number[];
  } | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Initialize settings form when org loads
  useEffect(() => {
    if (org && !settingsForm) {
      const dbSettings = org.settings as any;
      setSettingsForm({
        default_due_day: dbSettings?.billing?.default_due_day || 1,
        grace_period_days: dbSettings?.billing?.grace_period_days || 3,
        days_before_due: dbSettings?.reminders?.days_before_due || [3],
        days_after_due: dbSettings?.reminders?.days_after_due || [1, 5, 10]
      });
      setForm({
        name: org.name ?? '',
        email: org.email ?? '',
        phone: org.phone ?? '',
        timezone: (org as any).timezone ?? 'Africa/Kigali'
      });
    }
  }, [org, settingsForm]);

  const handleSaveProfile = () => {
    if (!form) return;
    updateOrg.mutate(form as any);
  };

  const handleSavePolicies = () => {
    if (!settingsForm) return;

    const currentSettings = (org?.settings as any) || {};
    const newSettings = {
      ...currentSettings,
      billing: {
        ...currentSettings.billing,
        default_due_day: settingsForm.default_due_day,
        grace_period_days: settingsForm.grace_period_days
      },
      reminders: {
        ...currentSettings.reminders,
        days_before_due: settingsForm.days_before_due,
        days_after_due: settingsForm.days_after_due
      }
    };

    updateOrg.mutate({ settings: newSettings } as any);
    toast.success("Billing policies updated successfully.");
  };

  const toggleDay = (array: number[], day: number, type: 'before' | 'after') => {
    const newArray = array.includes(day) ? array.filter(d => d !== day) : [...array, day].sort((a, b) => a - b);
    setSettingsForm(prev => prev ? { ...prev, [type === 'before' ? 'days_before_due' : 'days_after_due']: newArray } : null);
  };

  const [activeTab, setActiveTab] = useState('organisation');

  if (orgLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-12">
      <div className="page-header">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="text-muted-foreground">Settings</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue capitalize">{activeTab}</span>
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-bizrent-navy mt-1">Organisation Settings</h1>
          <p className="text-base font-medium text-muted-foreground mt-2">Manage your workspace, billing rules, and staff.</p>
        </div>
      </div>

      <Tabs defaultValue="organisation" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl h-auto mb-6 inline-flex overflow-x-auto max-w-full no-scrollbar">
          <TabsTrigger value="organisation" className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-bizrent-navy data-[state=active]:shadow-sm">Organisation</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-bizrent-navy data-[state=active]:shadow-sm">Team</TabsTrigger>
          <TabsTrigger value="policies" className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-bizrent-navy data-[state=active]:shadow-sm">Policies</TabsTrigger>
          <TabsTrigger value="billing" onClick={() => navigate('/landlord/billing')} className="rounded-lg text-sm font-bold px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-bizrent-navy data-[state=active]:shadow-sm">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="organisation" className="space-y-6 mt-0">
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy">Organisation Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 px-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="h-20 w-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group cursor-pointer hover:border-bizrent-blue hover:text-bizrent-blue transition-colors">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-bizrent-navy">Organisation Logo</p>
                  <p className="text-xs font-medium text-slate-500 mt-1 mb-2">Recommended size: 256x256px. Max 2MB.</p>
                  <Button variant="outline" size="sm" className="rounded-lg font-bold text-xs h-8">Upload Logo</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Organisation Name</Label>
                  <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" value={form?.name || ''} onChange={e => setForm(prev => prev ? { ...prev, name: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Support Email</Label>
                  <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" value={form?.email || ''} onChange={e => setForm(prev => prev ? { ...prev, email: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Support Phone</Label>
                  <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" placeholder="+250 7XX XXX XXX" value={form?.phone || ''} onChange={e => setForm(prev => prev ? { ...prev, phone: e.target.value } : null)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Timezone</Label>
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
                  <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Country</Label>
                  <Select defaultValue="RW" disabled>
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
              <CardTitle className="text-base font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy">Deactivate Organisation</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5 max-w-lg">
                    This will immediately hide your portfolio, disable all staff accounts under this workspace, and stop tenant access.
                  </p>
                </div>
                <Button variant="destructive" className="rounded-xl font-bold px-6">Deactivate Workspace</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-0">
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-bizrent-navy">Team Members</CardTitle>
              <Button onClick={() => setIsInviteModalOpen(true)} className="bg-bizrent-navy hover:bg-bizrent-navy/90 rounded-lg h-9 text-xs font-bold px-4 gap-2">
                <UserPlus className="h-3.5 w-3.5" /> Invite Staff
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <InviteStaffModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-border/40">
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">Name</th>
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">Email</th>
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">Role</th>
                      <th scope="col" className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:nth-child(even)]:bg-bizrent-light">
                    {(teamMembers ?? []).map(m => (
                      <tr key={m.id} className="transition-colors hover:bg-slate-50 border-b border-border/20">
                        <td className="px-6 py-4 font-bold text-bizrent-navy">{(m.user as any)?.full_name ?? '—'}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm font-medium">{(m.user as any)?.email ?? '—'}</td>
                        <td className="px-6 py-4"><StatusBadge status={m.role} /></td>
                        <td className="px-6 py-4 text-slate-500 text-[12px] font-semibold">{formatDate(m.created_at)}</td>
                      </tr>
                    ))}
                    {(!teamMembers || teamMembers.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                          No team members found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-sm font-bold text-bizrent-navy flex items-center gap-2"><Shield className="h-4 w-4 text-bizrent-blue"/> Role Permissions Guide</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="font-extrabold text-bizrent-navy text-sm uppercase tracking-wider">Owner</span>
                  <p className="text-[12px] text-slate-500 font-medium">Full access to manage properties, billing policies, and team members.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-bizrent-blue text-sm uppercase tracking-wider">Manager</span>
                  <p className="text-[12px] text-slate-500 font-medium">Can add units, invite tenants, and approve/reject MoMo payments.</p>
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-emerald-600 text-sm uppercase tracking-wider">Accountant</span>
                  <p className="text-[12px] text-slate-500 font-medium">View-only properties. Full access to manage invoices, receipts & reports.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6 mt-0">
          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-bizrent-blue" />
                Billing & Reminder Policy
              </CardTitle>
              <CardDescription className="text-muted-foreground font-medium mt-1 text-[13px]">
                Configure how the system handles automated invoicing, grace periods, and overdue escalation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6 px-6">
              {settingsForm && (
                <>
                {/* Timeline Visualization */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-3">
                    <span className="text-bizrent-blue">Invoice Sent</span>
                    <span className="text-bizrent-navy">Due Date</span>
                    <span className="text-red-500">Overdue</span>
                  </div>
                  <div className="relative h-2 bg-slate-200 rounded-full w-full flex items-center">
                    <div className="absolute left-0 h-2 bg-bizrent-blue/40 rounded-l-full" style={{width: '30%'}}></div>
                    <div className="absolute left-[30%] h-2 bg-bizrent-gold/50" style={{width: '20%'}}></div>
                    <div className="absolute left-[50%] h-2 bg-red-500/50 rounded-r-full" style={{width: '50%'}}></div>

                    {/* Markers */}
                    <div className="absolute left-[30%] -ml-1 h-4 w-2 bg-bizrent-navy rounded-full shadow-sm z-10"></div>
                  </div>
                  <div className="flex justify-between mt-3 text-[12px] text-slate-500 font-medium">
                    <span>-7 Days</span>
                    <span className="ml-12 font-bold text-bizrent-navy">Day {settingsForm.default_due_day}</span>
                    <span>+{settingsForm.grace_period_days} Days (Grace)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Default Billing Day</Label>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">Day</span>
                        <Input
                          type="number"
                          min="1"
                          max="28"
                          className="w-20 h-10 rounded-xl font-bold text-center border-border/60 focus-visible:ring-bizrent-blue/20"
                          value={settingsForm.default_due_day}
                          onChange={e => setSettingsForm({ ...settingsForm, default_due_day: Number(e.target.value) })}
                        />
                        <span className="text-sm font-medium text-muted-foreground">of the month</span>
                      </div>
                      <p className="text-[12px] text-slate-500 font-medium mt-1 leading-relaxed">
                        Invoices generate 7 days before this date.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        Grace Period <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-widest font-black text-[10px]">Important</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          className="w-20 h-10 rounded-xl font-bold text-center border-border/60 focus-visible:ring-bizrent-blue/20"
                          value={settingsForm.grace_period_days}
                          onChange={e => setSettingsForm({ ...settingsForm, grace_period_days: Number(e.target.value) })}
                        />
                        <span className="text-sm font-medium text-muted-foreground">days after due date</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-bizrent-blue" />
                        Pre-Due Reminders
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[7, 5, 3, 2, 1].map(day => (
                          <button
                            key={day}
                            onClick={() => toggleDay(settingsForm.days_before_due, day, 'before')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              settingsForm.days_before_due.includes(day)
                                ? 'bg-bizrent-navy text-white shadow-md shadow-bizrent-navy/20'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {day} Days Before
                          </button>
                        ))}
                      </div>
                      <p className="text-[12px] text-slate-500 font-medium mt-2 leading-relaxed">
                        Automated email reminders to tenants before the due date.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-red-500" />
                        Overdue Escalations
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
                      <p className="text-[12px] text-slate-500 font-medium mt-2 leading-relaxed">
                        Escalating notices sent automatically to overdue tenants.
                      </p>
                    </div>
                  </div>
                </div>
                </>
              )}

              <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90" onClick={handleSavePolicies} disabled={updateOrg.isPending}>
                {updateOrg.isPending ? 'Saving...' : 'Save Policies'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
              <CardTitle className="text-base font-bold text-bizrent-navy">Organisation Notifications</CardTitle>
              <CardDescription className="text-[12px] font-medium">Broadcast alerts affecting the whole organisation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6 px-6 pb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy">Payment Submissions</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Notify managers when tenants submit MoMo proof</p>
                </div>
                <Switch checked={notifPrefs?.payment_submissions ?? true} onCheckedChange={v => { updateNotifPrefs.mutate({ payment_submissions: v }); toast.success("Saved"); }} disabled={updateNotifPrefs.isPending} />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy">Overdue Invoices</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Alert when grace period expires</p>
                </div>
                <Switch checked={notifPrefs?.overdue_invoices ?? true} onCheckedChange={v => { updateNotifPrefs.mutate({ overdue_invoices: v }); toast.success("Saved"); }} disabled={updateNotifPrefs.isPending} />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy">Receipt Available</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Notify accountants when approved receipts are ready</p>
                </div>
                <Switch checked={true} disabled />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-bizrent-navy">Subscription Expiring</p>
                  <p className="text-[12px] font-medium text-slate-500 mt-0.5">Alert 7 days before trial or plan expiration</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-8 pb-4">
        <p className="text-xs font-medium text-slate-400 flex flex-col sm:flex-row items-center gap-1.5 opacity-80">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> 256-bit SSL encryption</span>
          <span className="hidden sm:inline">•</span>
          <span>Data secured by Supabase</span>
        </p>
      </div>
    </div>
  );
}
