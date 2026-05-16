import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Globe, Megaphone, Flag, Loader2, Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

function useAnnouncements() {
  return useQuery({
    queryKey: ['sa-announcements'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useFeatureFlags() {
  return useQuery({
    queryKey: ['sa-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin.from('feature_flags').select('*').order('flag_key');
      if (error) throw error;
      return data;
    },
  });
}

function usePlatformStats() {
  return useQuery({
    queryKey: ['sa-platform-stats'],
    queryFn: async () => {
      const [orgs, tenants, invoices, payments] = await Promise.all([
        supabaseAdmin.from('organisations').select('id, is_active, subscription_status', { count: 'exact' }),
        supabaseAdmin.from('user_organisation_roles').select('id', { count: 'exact' }).eq('role', 'TENANT').eq('is_active', true),
        supabaseAdmin.from('invoices').select('id, status, amount_due, amount_paid', { count: 'exact' }),
        supabaseAdmin.from('payments').select('id, status, amount', { count: 'exact' }).eq('status', 'APPROVED'),
      ]);
      const totalRWF = (payments.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
      const totalInvoiced = (invoices.data ?? []).reduce((s, i) => s + Number(i.amount_due), 0);
      const totalPaid = (invoices.data ?? []).reduce((s, i) => s + Number(i.amount_paid), 0);
      return {
        activeOrgs: (orgs.data ?? []).filter(o => o.is_active).length,
        totalOrgs: orgs.count ?? 0,
        activeTenants: tenants.count ?? 0,
        totalInvoiced,
        totalPaid,
        collectionRate: totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0,
        approvedPaymentsRWF: totalRWF,
        pendingInvoices: (invoices.data ?? []).filter(i => i.status === 'DUE').length,
        overdueInvoices: (invoices.data ?? []).filter(i => i.status === 'OVERDUE').length,
      };
    },
  });
}

export default function SystemVitals() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: announcements, isLoading: annLoading } = useAnnouncements();
  const { data: flags, isLoading: flagsLoading } = useFeatureFlags();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();

  const [newAnn, setNewAnn] = useState({ message: '', type: 'INFO', audience: 'ALL', active_until: '' });
  const [annDialogOpen, setAnnDialogOpen] = useState(false);

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin.from('system_announcements').insert({
        message: newAnn.message,
        type: newAnn.type,
        audience: newAnn.audience,
        active_until: newAnn.active_until ? new Date(newAnn.active_until).toISOString() : null,
        created_by: user?.id ?? null,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-announcements'] });
      toast.success('Announcement created');
      setAnnDialogOpen(false);
      setNewAnn({ message: '', type: 'INFO', audience: 'ALL', active_until: '' });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin.from('system_announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-announcements'] }); toast.success('Announcement removed'); },
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabaseAdmin.from('feature_flags')
        .update({ is_enabled: enabled, updated_by: user?.id, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-feature-flags'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const RWF = (n: number) => `RWF ${n.toLocaleString()}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">{t('legacy.systemVitals')}</h1>
        </div>
        <p className="text-muted-foreground text-sm">{t('legacy.platformWideKpisAnnouncementBarAndFeatureFlagConsole')}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700"><CardContent className="p-5"><div className="h-12 bg-slate-700 rounded animate-pulse" /></CardContent></Card>
        )) : [
          { label: 'Active Orgs', value: stats?.activeOrgs ?? 0, sub: `${stats?.totalOrgs ?? 0} total`, color: 'text-emerald-400' },
          { label: 'Active Tenants', value: stats?.activeTenants ?? 0, sub: 'across all orgs', color: 'text-blue-400' },
          { label: 'Collection Rate', value: `${stats?.collectionRate ?? 0}%`, sub: 'all-time platform', color: 'text-amber-400' },
          { label: 'Total RWF Processed', value: RWF(stats?.approvedPaymentsRWF ?? 0), sub: 'approved payments', color: 'text-purple-400' },
          { label: 'Overdue Invoices', value: stats?.overdueInvoices ?? 0, sub: 'need attention', color: 'text-red-400' },
          { label: 'Pending Invoices', value: stats?.pendingInvoices ?? 0, sub: 'awaiting payment', color: 'text-yellow-400' },
          { label: 'Total Invoiced', value: RWF(stats?.totalInvoiced ?? 0), sub: 'all time', color: 'text-slate-300' },
          { label: 'Total Paid', value: RWF(stats?.totalPaid ?? 0), sub: 'confirmed payments', color: 'text-slate-300' },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-5">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2">{label}</p>
              <p className={`text-2xl font-extrabold ${color} font-tabular-nums`}>{value}</p>
              <p className="text-muted-foreground text-xs mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="announcements">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="announcements" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-muted-foreground">
            <Megaphone className="h-3.5 w-3.5 mr-1.5" /> {t('legacy.announcementBar')}
          </TabsTrigger>
          <TabsTrigger value="flags" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-muted-foreground">
            <Flag className="h-3.5 w-3.5 mr-1.5" /> {t('legacy.featureFlags')}
          </TabsTrigger>
        </TabsList>

        {/* ─── Announcements ─── */}
        <TabsContent value="announcements" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">{t('legacy.activeBannersShownAtTheTopOfLandlordAndTenantPortals')}</p>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs" onClick={() => setAnnDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> {t('legacy.newAnnouncement')}
            </Button>
          </div>

          <div className="space-y-3">
            {annLoading ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700"><CardContent className="p-4"><div className="h-10 bg-slate-700 rounded animate-pulse" /></CardContent></Card>
            )) : (announcements ?? []).length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-10 text-center text-muted-foreground text-sm">{t('legacy.noActiveAnnouncements')}</CardContent>
              </Card>
            ) : (announcements ?? []).map(ann => {
              const typeColor = ann.type === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/30'
                : ann.type === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30';
              return (
                <Card key={ann.id} className={`bg-slate-800 border-l-4 ${ann.type === 'CRITICAL' ? 'border-l-red-500' : ann.type === 'WARNING' ? 'border-l-amber-500' : 'border-l-blue-500'} border-y-slate-700 border-r-slate-700`}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xxs ${typeColor}`}>{ann.type}</Badge>
                        <Badge className="bg-slate-700 text-slate-300 border-slate-600 text-xxs">{ann.audience}</Badge>
                        {ann.is_active && <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xxs">{t('legacy.live')}</Badge>}
                      </div>
                      <p className="text-white text-sm">{ann.message}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Created {formatDate(ann.created_at)}
                        {ann.active_until && ` · Expires ${formatDate(ann.active_until)}`}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 h-7 w-7"
                      onClick={() => deleteAnnouncement.mutate(ann.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Feature Flags ─── */}
        <TabsContent value="flags" className="mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm font-semibold">{t('legacy.platformFeatureToggles')}</CardTitle>
              <p className="text-muted-foreground text-xs">{t('legacy.changesTakeEffectImmediatelyFlagsAreCachedFor30Seconds')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {flagsLoading ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-700">
                  <div className="h-4 w-48 bg-slate-700 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-slate-700 rounded-full animate-pulse" />
                </div>
              )) : (flags ?? []).map(flag => (
                <div key={flag.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium font-mono">{flag.flag_key}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{flag.description ?? 'No description'}</p>
                    {flag.updated_at && <p className="text-muted-foreground text-xxs mt-0.5">Last updated {formatDate(flag.updated_at)}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`text-xxs ${flag.is_enabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-700 text-muted-foreground border-slate-600'}`}>
                      {flag.is_enabled ? 'ON' : 'OFF'}
                    </Badge>
                    <Switch
                      checked={flag.is_enabled}
                      onCheckedChange={v => toggleFlag.mutate({ id: flag.id, enabled: v })}
                      disabled={toggleFlag.isPending}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Announcement Dialog */}
      <Dialog open={annDialogOpen} onOpenChange={setAnnDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-emerald-400" /> {t('legacy.newSystemAnnouncement')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">{t('legacy.message')} <span className="text-red-500">*</span></Label>
              <Textarea value={newAnn.message} onChange={e => setNewAnn(a => ({ ...a, message: e.target.value }))}
                placeholder="e.g. Scheduled maintenance on 10 April 2026 from 02:00–04:00 UTC."
                className="bg-slate-900 border-slate-600 text-white placeholder:text-muted-foreground resize-none h-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">{t('legacy.type')}</Label>
                <Select value={newAnn.type} onValueChange={v => setNewAnn(a => ({ ...a, type: v }))}>
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="INFO" className="text-white">{t('legacy.info')}</SelectItem>
                    <SelectItem value="WARNING" className="text-amber-300">{t('legacy.warning')}</SelectItem>
                    <SelectItem value="CRITICAL" className="text-red-300">{t('legacy.critical')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-sm">{t('legacy.audience')}</Label>
                <Select value={newAnn.audience} onValueChange={v => setNewAnn(a => ({ ...a, audience: v }))}>
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="ALL" className="text-white">{t('legacy.allUsers')}</SelectItem>
                    <SelectItem value="LANDLORDS_ONLY" className="text-white">{t('legacy.landlordsOnly')}</SelectItem>
                    <SelectItem value="TENANTS_ONLY" className="text-white">{t('legacy.tenantsOnly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Expires At (optional)</Label>
              <Input type="datetime-local" value={newAnn.active_until} onChange={e => setNewAnn(a => ({ ...a, active_until: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setAnnDialogOpen(false)}>{t('legacy.cancel')}</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!newAnn.message.trim() || createAnnouncement.isPending}
              onClick={() => createAnnouncement.mutate()}>
              {createAnnouncement.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Publish Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}