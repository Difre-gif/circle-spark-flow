import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { Check, Zap, Shield, Crown, CreditCard, Building, CalendarDays } from 'lucide-react';
import {
  useOrganisation,
  useSubscription,
  useSubscriptionTiers,
  useDashboardStats,
  useProperties,
  formatDate,
  formatRWF,
} from '@/hooks/useSupabaseData';

const titleCase = (value: string) =>
  value.toLowerCase().replace(/(^|\s)\w/g, char => char.toUpperCase());

export default function Billing() {
  const { t } = useTranslation();
  const { data: org } = useOrganisation();
  const { data: subscription } = useSubscription();
  const { data: tiers } = useSubscriptionTiers();
  const { data: stats } = useDashboardStats();
  const { data: properties } = useProperties();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const maxUnits = (subscription?.tier_details as any)?.max_units ?? 0;
  const currentUnits = (stats?.occupiedUnits ?? 0) + (stats?.vacantUnits ?? 0);
  const maxProperties = (subscription?.tier_details as any)?.max_properties ?? 0;
  const currentProperties = properties?.length ?? 0;
  const usagePercent = maxUnits > 0 ? Math.min(100, Math.round((currentUnits / maxUnits) * 100)) : 0;
  const trialDaysRemaining = subscription?.trial_ends_at
    ? Math.max(0, differenceInCalendarDays(new Date(subscription.trial_ends_at), new Date()))
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl pb-12">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-bizrent-navy dark:text-white mt-1">{t('legacy.subscriptionBilling')}</h1>
          <p className="text-base font-medium text-muted-foreground mt-2">{t('legacy.reviewYourActivePlanCurrentUsageAndBillingDetails')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-card overflow-hidden flex flex-col">
          <CardHeader className="bg-card border-b border-border/40 pb-4 pt-6 px-6">
            <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white flex items-center gap-2"><Crown className="h-4 w-4 text-bizrent-amber"/> {t('legacy.currentPlan')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 px-6 flex-1">
            {subscription?.status === 'TRIAL' && trialDaysRemaining !== null && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-amber-800">Trial ends in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}</p>
                <p className="text-[12px] font-medium text-amber-700/80 mt-1">{t('legacy.planChangesAreNotSelfServeYet')}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{t('legacy.tier')}</p>
                <p className="font-extrabold text-2xl text-bizrent-navy dark:text-white uppercase mt-1">{subscription?.tier ?? org?.subscription_status ?? '—'}</p>
              </div>
              <StatusBadge status={subscription?.status ?? org?.subscription_status ?? 'TRIAL'} />
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-4">
              <p className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{t('legacy.currentUsage')}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-bizrent-navy dark:text-white">
                  <span>{t('legacy.units')}</span>
                  <span>{currentUnits} <span className="text-muted-foreground font-medium">of {maxUnits > 0 ? maxUnits : '∞'}</span></span>
                </div>
                {maxUnits > 0 && (
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-red-500' : 'bg-bizrent-emerald'}`} style={{ width: `${usagePercent}%` }} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-bizrent-navy dark:text-white">
                  <span>{t('legacy.properties')}</span>
                  <span>{currentProperties} <span className="text-muted-foreground font-medium">of {maxProperties > 0 ? maxProperties : '∞'}</span></span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-card overflow-hidden">
          <CardHeader className="bg-card border-b border-border/40 pb-4 pt-6 px-6 flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white">{t('legacy.planComparison')}</CardTitle>
            <div className="bg-muted p-1 rounded-xl flex items-center">
              <button
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-card shadow-sm text-bizrent-navy dark:text-white' : 'text-muted-foreground hover:text-foreground/80'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                {t('legacy.monthly')}
              </button>
              <button
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === 'annual' ? 'bg-card shadow-sm text-bizrent-navy dark:text-white' : 'text-muted-foreground hover:text-foreground/80'}`}
                onClick={() => setBillingCycle('annual')}
              >
                {t('legacy.annual')}
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(tiers ?? []).map(tier => {
                const isCurrent = subscription?.tier === tier.tier;
                const price = billingCycle === 'monthly' ? tier.monthly_price_rwf : tier.annual_price_rwf;
                return (
                  <div key={tier.id} className={`relative rounded-2xl border ${isCurrent ? 'border-bizrent-blue/50 bg-bizrent-blue/5 ring-1 ring-bizrent-blue/20' : 'border-border/60 hover:border-border'} p-6 transition-all`}>
                    {isCurrent && <div className="absolute top-0 right-6 -translate-y-1/2 bg-bizrent-blue text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{t('legacy.currentPlan')}</div>}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-xl ${tier.tier === 'GROWTH' ? 'bg-bizrent-navy text-white' : 'bg-blue-100 text-blue-600'}`}>
                        {tier.tier === 'GROWTH' ? <Building className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                      </div>
                      <h3 className="font-extrabold text-xl text-bizrent-navy dark:text-white">{titleCase(tier.tier)}</h3>
                    </div>
                    <div className="mb-6">
                      <p className="text-3xl font-black text-bizrent-navy dark:text-white">
                        {formatRWF(price)}
                        <span className="text-sm font-medium text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-2 text-sm font-medium text-foreground/80"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Up to {tier.max_units} units</li>
                      <li className="flex items-start gap-2 text-sm font-medium text-foreground/80"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Up to {tier.max_properties} propert{tier.max_properties === 1 ? 'y' : 'ies'}</li>
                      <li className="flex items-start gap-2 text-sm font-medium text-foreground/80"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> Up to {tier.max_managers} manager{tier.max_managers === 1 ? '' : 's'}</li>
                      {tier.has_whatsapp && <li className="flex items-start gap-2 text-sm font-medium text-foreground/80"><Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {t('legacy.whatsappReminders')}</li>}
                    </ul>
                    <Button className="w-full rounded-xl font-bold h-11" variant={isCurrent ? 'outline' : 'secondary'} disabled>
                      {isCurrent ? 'Active' : 'Plan changes coming soon'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 rounded-[1.5rem] shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow bg-card overflow-hidden">
        <CardHeader className="bg-card border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white flex items-center gap-2"><CreditCard className="h-4 w-4 text-bizrent-blue"/> {t('legacy.currentBillingDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-6 pb-6">
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('legacy.billingCycle')}</p>
                <p className="mt-2 font-bold text-bizrent-navy dark:text-white">{titleCase(subscription.billing_cycle)}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('legacy.planAmount')}</p>
                <p className="mt-2 font-bold text-bizrent-navy dark:text-white">{formatRWF(subscription.amount)}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('legacy.periodStart')}</p>
                <p className="mt-2 font-bold text-bizrent-navy dark:text-white">{formatDate(subscription.current_period_start) || '—'}</p>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('legacy.periodEnd')}</p>
                <p className="mt-2 font-bold text-bizrent-navy dark:text-white">{formatDate(subscription.current_period_end) || '—'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-muted-foreground">{t('legacy.noSubscriptionRecordIsAvailableYet')}</p>
            </div>
          )}
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-border bg-muted/70 p-4 text-sm text-muted-foreground">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-bizrent-blue" />
            <p>{t('legacy.selfServePlanChangesAndDownloadableBillingHistoryAreNotEnabledYetSoThi')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}