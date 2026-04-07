import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationPrefs, useUpdateNotificationPrefs } from '@/hooks/useSupabaseData';

export default function TenantProfile() {
  const { user } = useAuth();
  const { data: notifPrefs } = useNotificationPrefs();
  const updateNotifPrefs = useUpdateNotificationPrefs();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState<Partial<Record<string, string>>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    const errs: Partial<Record<string, string>> = {};
    if (!pwForm.current) errs.current = 'Current password is required.';
    if (!pwForm.next) errs.next = 'New password is required.';
    else if (pwForm.next.length < 8) errs.next = 'Password must be at least 8 characters.';
    if (!pwForm.confirm) errs.confirm = 'Please confirm your new password.';
    else if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match.';
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPwLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: pwForm.current });
      if (signInError) { setPwErrors({ current: 'Current password is incorrect.' }); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password: pwForm.next });
      if (updateError) throw new Error(updateError.message);
      toast.success('Password updated successfully.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Profile</h1><p className="text-muted-foreground">Manage your personal information</p></div>

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Full Name</Label><Input defaultValue={user?.name ?? ''} /></div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email ?? ''} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input defaultValue={user?.phone ?? ''} /></div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} placeholder="••••••••" value={pwForm.current} onChange={e => { setPwForm(f => ({ ...f, current: e.target.value })); setPwErrors(fe => ({ ...fe, current: undefined })); }} className="pr-10" />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwErrors.current && <p className="text-xs text-red-500">{pwErrors.current}</p>}
          </div>
          <div className="space-y-2">
            <Label>New Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input type={showNext ? 'text' : 'password'} placeholder="••••••••" value={pwForm.next} onChange={e => { setPwForm(f => ({ ...f, next: e.target.value })); setPwErrors(fe => ({ ...fe, next: undefined })); }} className="pr-10" />
              <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwErrors.next && <p className="text-xs text-red-500">{pwErrors.next}</p>}
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={pwForm.confirm} onChange={e => { setPwForm(f => ({ ...f, confirm: e.target.value })); setPwErrors(fe => ({ ...fe, confirm: undefined })); }} className="pr-10" />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwErrors.confirm && <p className="text-xs text-red-500">{pwErrors.confirm}</p>}
          </div>
          <Button onClick={handleChangePassword} disabled={pwLoading}>{pwLoading ? 'Updating...' : 'Update Password'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Invoice Reminders</p><p className="text-sm text-muted-foreground">Get reminded before due dates</p></div>
            <Switch
              checked={notifPrefs?.invoice_reminders ?? true}
              onCheckedChange={v => updateNotifPrefs.mutate({ invoice_reminders: v })}
              disabled={updateNotifPrefs.isPending}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Payment Status</p><p className="text-sm text-muted-foreground">Updates when payments are approved/rejected</p></div>
            <Switch
              checked={notifPrefs?.payment_status ?? true}
              onCheckedChange={v => updateNotifPrefs.mutate({ payment_status: v })}
              disabled={updateNotifPrefs.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
