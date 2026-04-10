import { useState } from 'react';
import { Loader2, Eye, EyeOff, Shield, Smartphone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Partial<Record<string, string>>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const calculateStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (pass.match(/[A-Z]/)) strength += 25;
    if (pass.match(/[0-9]/)) strength += 25;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const strength = calculateStrength(pwForm.next);

  const handleChangePassword = async () => {
    const errs: Partial<Record<string, string>> = {};
    if (!pwForm.current) errs.current = 'Current password is required.';
    if (!pwForm.next) errs.next = 'New password is required.';
    else if (pwForm.next.length < 8) errs.next = 'Password must be at least 8 characters.';
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match.';

    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPwLoading(true);
    if (!user?.email) { toast.error('Could not verify session.'); setPwLoading(false); return; }

    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pwForm.current });
    if (signInErr) { setPwErrors({ current: 'Current password is incorrect.' }); setPwLoading(false); return; }

    const { error: updateErr } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwLoading(false);

    if (updateErr) { toast.error(updateErr.message); return; }

    toast.success('Password updated successfully.');
    setPwForm({ current: '', next: '', confirm: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-12">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-bizrent-navy mt-1">My Profile</h1>
          <p className="text-base font-medium text-muted-foreground mt-2">Manage your personal account, security, and preferences.</p>
        </div>
      </div>

      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Full Name</Label>
              <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" defaultValue={user?.name} />
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Email Address</Label>
              <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20 bg-muted/30" defaultValue={user?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Phone</Label>
              <Input className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" placeholder="+250 7XX XXX XXX" />
            </div>
          </div>
          <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[12px] font-medium uppercase tracking-wider text-slate-700 flex items-center gap-2"><Globe className="h-4 w-4 text-bizrent-blue"/> Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="h-10 rounded-xl border-border/60 focus:ring-bizrent-blue/20 font-medium text-sm">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="rw">Kinyarwanda</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2"><Shield className="h-4 w-4 text-bizrent-blue"/> Security & Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-6 px-6">
          <div className="space-y-5 max-w-md">
            <div className="space-y-1">
              <Label htmlFor="current-pw" className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Current Password</Label>
              <div className="relative">
                <Input id="current-pw" type={showCurrent ? 'text' : 'password'} placeholder="••••••••" value={pwForm.current} onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwErrors(fe => ({ ...fe, current: undefined })); }} className="pr-10 h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>{showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              {pwErrors.current && <p className="text-[12px] text-red-500">{pwErrors.current}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="new-pw" className="text-[12px] font-medium uppercase tracking-wider text-slate-700">New Password</Label>
              <div className="relative">
                <Input id="new-pw" type={showNext ? 'text' : 'password'} placeholder="Min. 8 characters" value={pwForm.next} onChange={e => { setPwForm(f => ({ ...f, next: e.target.value })); setPwErrors(fe => ({ ...fe, next: undefined })); }} className="pr-10 h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" />
                <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>{showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>

              {pwForm.next && (
                <div className="pt-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: strength > 0 ? '25%' : '0%' }}></div>
                    <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: strength > 25 ? '25%' : '0%' }}></div>
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: strength > 50 ? '25%' : '0%' }}></div>
                    <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: strength > 75 ? '25%' : '0%' }}></div>
                  </div>
                  <div className="flex flex-col gap-1 mt-3">
                    <span className={`text-[12px] flex items-center gap-1.5 ${pwForm.next.length >= 8 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${pwForm.next.length >= 8 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Minimum 8 characters
                    </span>
                    <span className={`text-[12px] flex items-center gap-1.5 ${pwForm.next.match(/[A-Z]/) ? 'text-emerald-600' : 'text-slate-500'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${pwForm.next.match(/[A-Z]/) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> One uppercase letter
                    </span>
                    <span className={`text-[12px] flex items-center gap-1.5 ${pwForm.next.match(/[0-9]/) ? 'text-emerald-600' : 'text-slate-500'}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${pwForm.next.match(/[0-9]/) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> One number
                    </span>
                  </div>
                </div>
              )}
              {pwErrors.next && <p className="text-[12px] text-red-500">{pwErrors.next}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-pw" className="text-[12px] font-medium uppercase tracking-wider text-slate-700">Confirm New Password</Label>
              <Input id="confirm-pw" type="password" placeholder="••••••••" value={pwForm.confirm} onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwErrors(fe => ({ ...fe, confirm: undefined })); }} className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20" />
              {pwErrors.confirm && <p className="text-[12px] text-red-500">{pwErrors.confirm}</p>}
            </div>

            <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90" onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Update Password'}
            </Button>
          </div>

          <Separator />

          <div>
            <h3 className="font-bold text-bizrent-navy mb-1 text-sm">Two-Factor Authentication (2FA)</h3>
            <p className="text-[12px] text-slate-500 mb-4">Add an extra layer of security to your account.</p>
            <Button variant="outline" className="rounded-xl font-semibold h-10 border-border/60" disabled>
              <Smartphone className="h-4 w-4 mr-2" /> Enable 2FA (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy">Personal Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-bizrent-navy">Email Notifications</p>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Receive account updates and security alerts via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-bizrent-navy">SMS Alerts</p>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Get urgent updates via SMS (requires phone number)</p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
