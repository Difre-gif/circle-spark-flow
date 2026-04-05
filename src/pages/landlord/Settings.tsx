import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/StatusBadge';
import { useOrganisation, useUpdateOrganisation, useSubscription, formatRWF } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Check, Zap, Shield, Crown } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { data: org, isLoading: orgLoading } = useOrganisation();
  const { data: subscription } = useSubscription();
  const updateOrg = useUpdateOrganisation();
  const [form, setForm] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);

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
            <Button 
              variant="outline" 
              className="w-full mt-2 rounded-xl font-semibold border-border/80 text-bizrent-navy hover:bg-slate-50"
              onClick={() => setPricingOpen(true)}
            >
              Upgrade Plan
            </Button>
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

      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogContent className="sm:max-w-4xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-3xl font-extrabold text-bizrent-navy">Upgrade Your Business</DialogTitle>
            <DialogDescription className="text-md font-medium">
              Choose the perfect tier for your expanding property portfolio.
            </DialogDescription>
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