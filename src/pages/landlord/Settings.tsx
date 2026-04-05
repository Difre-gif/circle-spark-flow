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

  if (orgLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  const currentForm = form ?? { name: org?.name ?? '', email: org?.email ?? '', phone: org?.phone ?? '' };

  const handleSave = () => {
    updateOrg.mutate(currentForm);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div className="page-header">
        <div>
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest">System / Settings</p>
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
              <Input className="focus-visible:ring-bizrent-blue/20 rounded-xl" value={currentForm.phone} onChange={e => setForm({ ...currentForm, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy opacity-70">Country</Label>
              <Input className="rounded-xl bg-muted/50 opacity-70" value={org?.country_code ?? 'RW'} disabled />
            </div>
          </div>
          <Button className="rounded-xl font-semibold bg-bizrent-navy hover:bg-bizrent-navy/90" onClick={handleSave} disabled={updateOrg.isPending}>
            {updateOrg.isPending ? 'Saving...' : 'Save Changes'}
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
            <Button variant="outline" className="w-full mt-2 rounded-xl font-semibold border-border/80 text-bizrent-navy hover:bg-slate-50">Upgrade Plan</Button>
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
              <Switch defaultChecked />
            </div>
            <Separator className="bg-border/50" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-bizrent-navy">Overdue Invoices</p>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">Alert when invoices become overdue</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}