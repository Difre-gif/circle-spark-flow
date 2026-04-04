import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/StatusBadge';
import { useOrganisation, useUpdateOrganisation, useSubscription } from '@/hooks/useSupabaseData';

export default function Settings() {
  const { data: org, isLoading: orgLoading } = useOrganisation();
  const { data: subscription } = useSubscription();
  const updateOrg = useUpdateOrganisation();
  const [form, setForm] = useState<{ name: string; email: string; phone: string } | null>(null);

  if (orgLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const currentForm = form ?? { name: org?.name ?? '', email: org?.email ?? '', phone: org?.phone ?? '' };

  const handleSave = () => {
    updateOrg.mutate(currentForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your organisation and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Organisation Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Organisation Name</Label><Input value={currentForm.name} onChange={e => setForm({ ...currentForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={currentForm.email} onChange={e => setForm({ ...currentForm, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={currentForm.phone} onChange={e => setForm({ ...currentForm, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Country</Label><Input value={org?.country_code ?? 'RW'} disabled /></div>
          </div>
          <Button onClick={handleSave} disabled={updateOrg.isPending}>{updateOrg.isPending ? 'Saving...' : 'Save Changes'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={org?.subscription_status ?? 'TRIAL'} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tier</span>
            <span className="font-bold text-lg">{subscription?.tier ?? org?.subscription_status ?? '—'}</span>
          </div>
          {subscription?.tier_details && <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Max Properties</span>
              <span>{(subscription.tier_details as any)?.max_properties ?? '—'}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Max Units</span>
              <span>{(subscription.tier_details as any)?.max_units ?? '—'}</span>
            </div>
          </>}
          <Button variant="outline" className="mt-4">Upgrade Plan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Payment Submissions</p><p className="text-sm text-muted-foreground">Get notified when tenants submit payments</p></div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Overdue Invoices</p><p className="text-sm text-muted-foreground">Alert when invoices become overdue</p></div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
