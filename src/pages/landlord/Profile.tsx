import { useState, useEffect, useMemo } from 'react';
import { Loader2, Eye, EyeOff, Shield, Smartphone, User, CheckCircle2, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateUserProfile } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  const src = name?.trim() || email || '';
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function roleLabel(role: string | undefined) {
  if (!role) return '';
  if (role === 'landlord') return 'Admin / Landlord';
  if (role === 'tenant') return 'Tenant';
  return role;
}

export default function Profile() {
  const { user } = useAuth();
  const updateProfile = useUpdateUserProfile();

  const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
  const [savedForm, setSavedForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });

  useEffect(() => {
    if (user) {
      const next = { name: user.name ?? '', phone: user.phone ?? '' };
      setForm(next);
      setSavedForm(next);
    }
  }, [user?.id]);

  const isDirty = form.name !== savedForm.name || form.phone !== savedForm.phone;

  const profileErrors = useMemo(() => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push('Full name is required.');
    if (form.phone && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) {
      errs.push('Enter a valid phone number.');
    }
    return errs;
  }, [form]);

  const handleSaveProfile = () => {
    if (profileErrors.length > 0) { toast.error(profileErrors[0]); return; }
    updateProfile.mutate(
      { full_name: form.name.trim(), phone: form.phone.trim() },
      { onSuccess: () => setSavedForm({ name: form.name.trim(), phone: form.phone.trim() }) }
    );
  };

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Partial<Record<string, string>>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const strength = useMemo(() => {
    let s = 0;
    if (pwForm.next.length >= 8) s += 25;
    if (pwForm.next.match(/[A-Z]/)) s += 25;
    if (pwForm.next.match(/[0-9]/)) s += 25;
    if (pwForm.next.match(/[^A-Za-z0-9]/)) s += 25;
    return s;
  }, [pwForm.next]);

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
    setPwErrors({});
  };

  const initials = getInitials(user?.name, user?.email);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl pb-12">
      {/* ── Profile hero ── */}
      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] bg-gradient-to-br from-bizrent-navy to-bizrent-blue overflow-hidden">
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-extrabold tracking-tight select-none shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-extrabold text-xl leading-tight truncate">{user?.name || user?.email || 'My Account'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {user?.email && (
                <span className="flex items-center gap-1 text-white/70 text-xs font-medium">
                  <Mail className="h-3 w-3" /> {user.email}
                </span>
              )}
              {user?.role && (
                <Badge className="bg-white/15 text-white border-0 text-[11px] font-bold px-2 py-0.5">
                  {roleLabel(user.role)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Personal information ── */}
      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2">
            <User className="h-4 w-4 text-bizrent-blue" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Full Name</Label>
              <Input
                className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <div className="relative">
                <Input
                  className="h-10 rounded-xl border-border/60 bg-muted/30 pr-10"
                  value={user?.email ?? ''}
                  disabled
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Contact support to change your email.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <Input
                className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20"
                placeholder="+250 7XX XXX XXX"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          {profileErrors.length > 0 && isDirty && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {profileErrors[0]}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90"
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending || !isDirty || profileErrors.length > 0}
            >
              {updateProfile.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : isDirty ? 'Save Changes' : 'Saved'}
            </Button>
            {isDirty && (
              <span className="text-xs font-bold text-amber-700">Unsaved changes</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Security ── */}
      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2">
            <Shield className="h-4 w-4 text-bizrent-blue" /> Security & Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-6 px-6">
          <div className="space-y-5 max-w-md">
            {/* Current password */}
            <div className="space-y-1.5">
              <Label htmlFor="current-pw" className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pwForm.current}
                  onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwErrors(fe => ({ ...fe, current: undefined })); }}
                  className="pr-10 h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwErrors.current && <p className="text-[12px] text-red-500">{pwErrors.current}</p>}
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNext ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={pwForm.next}
                  onChange={e => { setPwForm(f => ({ ...f, next: e.target.value })); setPwErrors(fe => ({ ...fe, next: undefined })); }}
                  className="pr-10 h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20"
                />
                <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                  {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {pwForm.next && (
                <div className="pt-2 space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    {[25, 50, 75, 100].map(threshold => (
                      <div
                        key={threshold}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          strength >= threshold
                            ? strength <= 25 ? 'bg-red-500' : strength <= 50 ? 'bg-amber-400' : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    {[
                      { label: 'Minimum 8 characters', met: pwForm.next.length >= 8 },
                      { label: 'One uppercase letter', met: !!pwForm.next.match(/[A-Z]/) },
                      { label: 'One number', met: !!pwForm.next.match(/[0-9]/) },
                    ].map(({ label, met }) => (
                      <span key={label} className={`text-[12px] flex items-center gap-1.5 ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {pwErrors.next && <p className="text-[12px] text-red-500">{pwErrors.next}</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                placeholder="••••••••"
                value={pwForm.confirm}
                onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwErrors(fe => ({ ...fe, confirm: undefined })); }}
                className="h-10 rounded-xl border-border/60 focus-visible:ring-bizrent-blue/20"
              />
              {pwErrors.confirm && <p className="text-[12px] text-red-500">{pwErrors.confirm}</p>}
            </div>

            <Button
              className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90"
              onClick={handleChangePassword}
              disabled={pwLoading}
            >
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

      {/* ── Notification preferences ── */}
      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6 px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-bizrent-navy">Email Notifications</p>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Receive account updates and security alerts via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator className="bg-border/50" />
          <div className="flex items-center justify-between gap-4 opacity-60">
            <div>
              <p className="font-bold text-sm text-bizrent-navy">SMS Alerts</p>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">Requires a verified phone number — coming soon</p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
