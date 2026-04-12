import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { Check, Zap, Shield, Crown, ArrowRight, CreditCard, Building } from 'lucide-react';
import { useOrganisation, useSubscription, formatRWF } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

export default function Billing() {
  const { data: org } = useOrganisation();
  const { data: subscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const maxUnits = (subscription?.tier_details as any)?.max_units ?? 0;
  const currentUnits = 3; // Placeholder for demo - would come from useDashboardStats in real app
  const maxProperties = (subscription?.tier_details as any)?.max_properties ?? 0;
  const currentProperties = 1;

  const usagePercent = maxUnits > 0 ? Math.min(100, Math.round((currentUnits / maxUnits) * 100)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl pb-12">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-bizrent-navy mt-1">Subscription & Billing</h1>
          <p className="text-base font-medium text-muted-foreground mt-2">Manage your subscription tier, billing cycle, and invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Overview */}
        <Card className="lg:col-span-1 border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden flex flex-col">
          <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
            <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2"><Crown className="h-4 w-4 text-bizrent-amber"/> Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-6 flex-1">

            {subscription?.status === 'TRIAL' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-amber-800">Trial ends in 14 days</p>
                <p className="text-[12px] font-medium text-amber-700/80 mt-1">Upgrade to keep access to all features.</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-slate-500">Tier</p>
                <p className="font-extrabold text-2xl text-bizrent-navy uppercase mt-1">{subscription?.tier ?? org?.subscription_status ?? '—'}</p>
              </div>
              <StatusBadge status={org?.subscription_status ?? 'TRIAL'} />
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <p className="text-[12px] font-medium uppercase tracking-wider text-slate-500">Current Usage</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-bizrent-navy">
                  <span>Units</span>
                  <span>{currentUnits} <span className="text-slate-400 font-medium">of {maxUnits > 0 ? maxUnits : '∞'}</span></span>
                </div>
                {maxUnits > 0 && (
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-red-500' : 'bg-bizrent-emerald'}`} style={{ width: `${usagePercent}%` }}></div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-bizrent-navy">
                  <span>Properties</span>
                  <span>{currentProperties} <span className="text-slate-400 font-medium">of {maxProperties > 0 ? maxProperties : '∞'}</span></span>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Upgrade / Plans */}
        <Card className="lg:col-span-2 border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
          <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-bizrent-navy">Available Plans</CardTitle>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center">
              <button
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-bizrent-navy' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === 'annual' ? 'bg-white shadow-sm text-bizrent-navy' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setBillingCycle('annual')}
              >
                Annual <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-widest leading-none">Save 20%</span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Startup */}
              <div className={`relative rounded-2xl border ${subscription?.tier === 'STARTER' ? 'border-bizrent-blue/50 bg-bizrent-blue/5 ring-1 ring-bizrent-blue/20' : 'border-border/60 hover:border-border'} p-6 transition-all`}>
                {subscription?.tier === 'STARTER' && <div className="absolute top-0 right-6 -translate-y-1/2 bg-bizrent-blue text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Current Plan</div>}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-blue-100 rounded-xl"><Zap className="h-5 w-5 text-blue-600" /></div>
                  <h3 className="font-extrabold text-xl text-bizrent-navy">Startup</h3>
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-black text-bizrent-navy">
                    {billingCycle === 'monthly' ? formatRWF(15000) : formatRWF(15000 * 12 * 0.8)}
                    <span className="text-sm font-medium text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Up to 15 Units</li>
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> 1 Property</li>
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> 1 Manager Account</li>
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Email Invoicing</li>
                </ul>
                <Button className="w-full rounded-xl font-bold h-11" variant={subscription?.tier === 'STARTER' ? 'outline' : 'default'} disabled={subscription?.tier === 'STARTER'}>
                  {subscription?.tier === 'STARTER' ? 'Active' : 'Downgrade'}
                </Button>
              </div>

              {/* Growth */}
              <div className={`relative rounded-2xl border ${subscription?.tier === 'GROWTH' ? 'border-bizrent-blue/50 bg-bizrent-blue/5 ring-1 ring-bizrent-blue/20' : 'border-bizrent-navy shadow-lg shadow-bizrent-navy/5'} p-6 transition-all`}>
                {subscription?.tier !== 'GROWTH' && <div className="absolute top-0 right-6 -translate-y-1/2 bg-bizrent-navy text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Recommended</div>}
                {subscription?.tier === 'GROWTH' && <div className="absolute top-0 right-6 -translate-y-1/2 bg-bizrent-blue text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Current Plan</div>}

                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-bizrent-navy text-white rounded-xl"><Building className="h-5 w-5" /></div>
                  <h3 className="font-extrabold text-xl text-bizrent-navy">Growth</h3>
                </div>
                <div className="mb-6">
                  <p className="text-3xl font-black text-bizrent-navy">
                    {billingCycle === 'monthly' ? formatRWF(45000) : formatRWF(45000 * 12 * 0.8)}
                    <span className="text-sm font-medium text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Up to 50 Units</li>
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Up to 3 Properties</li>
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Up to 3 Managers</li>
                  <li className="flex items-start gap-2 text-sm font-medium text-slate-700"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> WhatsApp & SMS Reminders</li>
                </ul>
                <Button className="w-full rounded-xl font-bold h-11 bg-bizrent-navy hover:bg-bizrent-navy/90 text-white border-0" disabled={subscription?.tier === 'GROWTH'} onClick={() => toast.success('Upgrade process initiated.')}>
                  {subscription?.tier === 'GROWTH' ? 'Active' : <span className="flex items-center gap-2">Upgrade to Growth <ArrowRight className="h-4 w-4"/></span>}
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History Placeholder */}
      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-white overflow-hidden">
        <CardHeader className="bg-white border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy flex items-center gap-2"><CreditCard className="h-4 w-4 text-bizrent-blue"/> Billing History</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-6">
          <div className="text-center py-8">
            <p className="text-sm font-medium text-muted-foreground">No past billing history available.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}