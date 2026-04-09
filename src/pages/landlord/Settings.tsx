import { useState, useEffect } from 'react';
import { Loader2, Eye, EyeOff, CalendarClock, BellRing } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/StatusBadge';
import { useOrganisation, useUpdateOrganisation, useSubscription, formatRWF, useNotificationPrefs, useUpdateNotificationPrefs } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc } from '@/components/ui/dialog';
import { Check, Zap, Shield, Crown, ChevronRight, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Settings() {
  const { data: org, isLoading: orgLoading } = useOrganisation();
  const { data: subscription } = useSubscription();
  const updateOrg = useUpdateOrganisation();
  const { data: notifPrefs } = useNotificationPrefs();
  const updateNotifPrefs = useUpdateNotificationPrefs();
  
  const [form, setForm] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [settingsForm, setSettingsForm] = useState<{ 
    default_due_day: number; 
    grace_period_days: number;
    days_before_due: string;
    days_after_due: string;
  } | null>(null);
  
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Partial<Record<string, string>>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  // Initialize settings form when org loads
  useEffect(() => {
    if (org && !settingsForm) {
      const dbSettings = org.settings as any;
      setSettingsForm({
        default_due_day: dbSettings?.billing?.default_due_day || 1,
        grace_period_days: dbSettings?.billing?.grace_period_days || 3,
        days_before_due: (dbSettings?.reminders?.days_before_due || [3]).join(', '),
        days_after_due: (dbSettings?.reminders?.days_after_due || [1, 5, 10]).join(', ')
      });
    }
  }, [org, settingsForm]);

  const handleChangePassword = async () => {
    const errs: Partial<Record<string, string>> = {};
    if (!pwForm.current) errs.current = 'Current password is required.';
    if (!pwForm.next) errs.next = 'New password is required.';
    else if (pwForm.next.length < 8) errs.next = 'Password must be at least 8 characters.';
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match.';
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPwLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { toast.error('Could not verify session.'); setPwLoading(false); return; }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pwForm.current });
    if (signInErr) { setPwErrors({ current: 'Current password is incorrect.' }); setPwLoading(false); return; }
    const { error: updateErr } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwLoading(false);
    if (updateErr) { toast.error(updateErr.message); return; }
    toast.success('Password updated successfully.');
    setPwForm({ current: '', next: '', confirm: '' });
  };

  if (orgLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  const currentForm = form ?? { name: org?.name ?? '', email: org?.email ?? '', phone: org?.phone ?? '' };

  const handleSave = () => {
    updateOrg.mutate(currentForm);
  };
  
  const handleSaveSettings = () => {
    if (!settingsForm) return;
    
    // Parse the comma-separated strings back into arrays of numbers
    const parseNumberArray = (str: string) => 
      str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

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
        days_before_due: parseNumberArray(settingsForm.days_before_due),
        days_after_due: parseNumberArray(settingsForm.days_after_due)
      }
    };
    
    updateOrg.mutate({ settings: newSettings } as any);
    toast.success("Billing policies updated successfully.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div className="page-header">
        <div>
          <p className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy transition-colors">System</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">Settings</span>
          </p>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage your organisation and preferences</p>
        </div>
      </div>

      <Card className="border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-lg font-bold text-bizrent-navy">Organisation Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Organisation Name</Label>
              <Input className="focus-visible:ring-bizrent-blue/20 rounded-xl" value={currentForm.name} onChange={e => setForm({ ...currentForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Email</Label>
              <Input className="focus-visible:ring-bizrent-blue/20 rounded-xl" value={currentForm.email} onChange={e => setForm({ ...currentForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Phone</Label>
              <div className="relative">
                <Input 
                  className="focus-visible:ring-bizrent-blue/20 rounded-xl pl-4" 
                  placeholder="+250 7XX XXX XXX"
                  value={currentForm.phone} 
                  onChange={e => setForm({ ...currentForm, phone: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Country</Label>
              <Select defaultValue="RW" disabled>
                <SelectTrigger className="w-full rounded-xl bg-muted/30 focus:ring-0 cursor-not-allowed text-muted-foreground font-medium">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RW">Rwanda (RW)</SelectItem>
                  <SelectItem value="KE">Kenya (KE)</SelectItem>
                  <SelectItem value="UG">Uganda (UG)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90" onClick={handleSave} disabled={updateOrg.isPending}>
            {updateOrg.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-lg font-bold text-bizrent-navy flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-bizrent-blue" />
            Billing & Reminder Policy
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium mt-1">
            Configure how the system handles automated invoicing, grace periods, and overdue escalation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6 px-6">
          {settingsForm && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-bizrent-navy">Default Billing Day</Label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Day</span>
                    <Input 
                      type="number" 
                      min="1" 
                      max="28" 
                      className="w-20 rounded-xl font-bold text-center focus-visible:ring-bizrent-blue/20" 
                      value={settingsForm.default_due_day}
                      onChange={e => setSettingsForm({ ...settingsForm, default_due_day: Number(e.target.value) })}
                    />
                    <span className="text-sm font-medium text-muted-foreground">of the month</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                    Invoices will automatically generate 7 days before this date. <br/>(e.g., if set to 5th, invoices generate on the 28th).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-bizrent-navy flex items-center gap-2">
                    Grace Period <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-extrabold">Important</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      min="0" 
                      max="30" 
                      className="w-20 rounded-xl font-bold text-center focus-visible:ring-bizrent-blue/20" 
                      value={settingsForm.grace_period_days}
                      onChange={e => setSettingsForm({ ...settingsForm, grace_period_days: Number(e.target.value) })}
                    />
                    <span className="text-sm font-medium text-muted-foreground">days after due date</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                    Payments are considered <span className="text-amber-600 font-bold">LATE</span> immediately after the due date, but will only escalate to <span className="text-red-600 font-bold">OVERDUE</span> status (triggering staff action) after this grace period ends.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="bg-border/50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-bizrent-navy flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-bizrent-blue" />
                    Pre-Due Reminders
                  </Label>
                  <Input 
                    type="text" 
                    className="w-full rounded-xl font-bold focus-visible:ring-bizrent-blue/20" 
                    placeholder="e.g. 7, 3, 1"
                    value={settingsForm.days_before_due}
                    onChange={e => setSettingsForm({ ...settingsForm, days_before_due: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                    Comma-separated list of days <strong className="text-bizrent-navy">before</strong> the due date to send automated email reminders to tenants.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-bizrent-navy flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-red-500" />
                    Overdue Escalation Messages
                  </Label>
                  <Input 
                    type="text" 
                    className="w-full rounded-xl font-bold focus-visible:ring-red-500/20 border-red-200" 
                    placeholder="e.g. 1, 5, 10"
                    value={settingsForm.days_after_due}
                    onChange={e => setSettingsForm({ ...settingsForm, days_after_due: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed">
                    Comma-separated list of days <strong className="text-red-600">after</strong> the due date to send escalating overdue notices.
                  </p>
                </div>
              </div>
            </div>
            </>
          )}

          <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90" onClick={handleSaveSettings} disabled={updateOrg.isPending}>
            {updateOrg.isPending ? 'Saving...' : 'Save Policy'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4 pt-6 px-6">
            <CardTitle className="text-lg font-bold text-bizrent-navy">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-6">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Status</span>
              <StatusBadge status={org?.subscription_status ?? 'TRIAL'} />
            </div>
            <Separator className="bg-border/50" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Tier</span>
              <span className="font-extrabold text-lg text-bizrent-navy uppercase">{subscription?.tier ?? org?.subscription_status ?? '—'}</span>
            </div>
            {subscription?.tier_details && <>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">Max Properties</span>
                <span className="font-bold text-bizrent-slate">{(subscription.tier_details as any)?.max_properties ?? '—'}</span>
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">Max Units</span>
                <span className="font-bold text-bizrent-slate">{(subscription.tier_details as any)?.max_units ?? '—'}</span>
              </div>
            </>}
            <Button 
              className="w-full mt-6 rounded-xl font-bold bg-bizrent-navy hover:bg-bizrent-navy/90 text-white shadow-lg shadow-bizrent-navy/10 h-12"
              onClick={() => setPricingOpen(true)}
            >
              Upgrade Plan to Unlock Features
            </Button>
            {subscription?.status === 'TRIAL' && (
              <p className="text-center text-xs font-bold text-bizrent-red mt-3 bg-red-50 p-2 rounded-xl">
                ⚠️ Your trial expires in 14 days
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 pb-4 pt-6 px-6">
            <CardTitle className="text-lg font-bold text-bizrent-navy">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-bizrent-navy">Payment Submissions</p>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">Get notified when tenants submit payments</p>
                </div>
                <Switch
                  checked={notifPrefs?.payment_submissions ?? true}
                  onCheckedChange={v => { updateNotifPrefs.mutate({ payment_submissions: v }); toast.success("Notification preferences saved"); }}
                  disabled={updateNotifPrefs.isPending}
                />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-bizrent-navy">Overdue Invoices</p>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">Alert when invoices become overdue</p>
                </div>
                <Switch
                  checked={notifPrefs?.overdue_invoices ?? true}
                  onCheckedChange={v => { updateNotifPrefs.mutate({ overdue_invoices: v }); toast.success("Notification preferences saved"); }}
                  disabled={updateNotifPrefs.isPending}
                />
              </div>
          </CardContent>
        </Card>
      </div>


      {/* Change Password */}
      <Card className="border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-lg font-bold text-bizrent-navy">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 px-6">
          <div className="space-y-1">
            <Label className="font-semibold text-bizrent-navy">Current Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} placeholder="••••••••" value={pwForm.current} onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwErrors(fe => ({ ...fe, current: undefined })); }} className="pr-10 focus-visible:ring-bizrent-blue/20 rounded-xl" />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            {pwErrors.current && <p className="text-xs text-red-500">{pwErrors.current}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="font-semibold text-bizrent-navy">New Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input type={showNext ? 'text' : 'password'} placeholder="Min. 8 characters" value={pwForm.next} onChange={e => { setPwForm(f => ({ ...f, next: e.target.value })); setPwErrors(fe => ({ ...fe, next: undefined })); }} className="pr-10 focus-visible:ring-bizrent-blue/20 rounded-xl" />
                <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>{showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {pwErrors.next && <p className="text-xs text-red-500">{pwErrors.next}</p>}
            </div>
            <div className="space-y-1">
              <Label className="font-semibold text-bizrent-navy">Confirm New Password <span className="text-red-500">*</span></Label>
              <Input type="password" placeholder="••••••••" value={pwForm.confirm} onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwErrors(fe => ({ ...fe, confirm: undefined })); }} className="focus-visible:ring-bizrent-blue/20 rounded-xl" />
              {pwErrors.confirm && <p className="text-xs text-red-500">{pwErrors.confirm}</p>}
            </div>
          </div>
          <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90" onClick={handleChangePassword} disabled={pwLoading}>
            {pwLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Update Password'}
          </Button>
        </CardContent>
        </Card>

        <div className="flex justify-center pt-8 pb-4 col-span-full">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <Shield className="h-3.5 w-3.5" /> Secured with 256-bit encryption
          </p>
        </div>

      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogContent className="sm:max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-3xl font-extrabold text-bizrent-navy">Upgrade Your Business</DialogTitle>
            <DialogDesc className="text-md font-medium">
              Choose the perfect tier for your expanding property portfolio.
            </DialogDesc>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Basic */}
            <Card className="border border-border/50 rounded-2xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-bizrent-blue/10 rounded-xl w-fit">
                <Zap className="h-6 w-6 text-bizrent-blue" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-bizrent-navy">Startup</h3>
                <p className="text-2xl font-black mt-2 text-bizrent-navy">{formatRWF(15000)}<span className="text-xs font-medium text-muted-foreground">/mo</span></p>
              </div>
              <Separator />
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> 1-5 Units</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> MoMo Integration</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> 1 Staff Account</li>
              </ul>
              <Button className="w-full rounded-xl" variant="outline" onClick={() => {toast.info('Contact sales to downgrade'); setPricingOpen(false);}}>Current Plan</Button>
            </Card>

            {/* Pro */}
            <Card className="border-2 border-bizrent-blue rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden bg-slate-50/50">
              <div className="absolute top-3 right-3 bg-bizrent-blue text-white text-[10px] font-bold px-2 py-1 rounded">POPULAR</div>
              <div className="p-3 bg-bizrent-blue rounded-xl w-fit">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-bizrent-navy">Enterprise</h3>
                <p className="text-2xl font-black mt-2 text-bizrent-navy">{formatRWF(45000)}<span className="text-xs font-medium text-muted-foreground">/mo</span></p>
              </div>
              <Separator />
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> Up to 50 Units</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> SMS Reminders</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> Unlimited Staff</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> Custom Reports</li>
              </ul>
              <Button className="w-full rounded-xl bg-bizrent-blue hover:bg-bizrent-blue/90" onClick={() => {toast.success('Upgrade request sent!'); setPricingOpen(false);}}>Upgrade Now</Button>
            </Card>

            {/* Custom */}
            <Card className="border border-border/50 rounded-2xl p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-bizrent-navy/10 rounded-xl w-fit">
                <Crown className="h-6 w-6 text-bizrent-navy" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-bizrent-navy">Custom</h3>
                <p className="text-2xl font-black mt-2 text-bizrent-navy">Contact Us</p>
              </div>
              <Separator />
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> 50+ Units</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> API Access</li>
                <li className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-bizrent-emerald" /> Dedicated Support</li>
              </ul>
              <Button className="w-full rounded-xl" variant="outline" onClick={() => {toast.info('Redirecting to support...'); setPricingOpen(false);}}>Talk to Sales</Button>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}