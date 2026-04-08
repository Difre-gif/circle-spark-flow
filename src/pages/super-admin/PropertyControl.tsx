import { useState } from 'react';
import { Building2, Search, Home, RefreshCw, ToggleLeft, ToggleRight, MapPin, Users, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GlobalProperty {
  id: string;
  name: string;
  address: string;
  property_type: string;
  is_active: boolean;
  unit_count: number;
  org_name: string;
  org_id: string;
  created_at: string;
}

interface GlobalUnit {
  id: string;
  unit_number: string;
  unit_type: string;
  monthly_rent: number;
  status: string;
  property_name: string;
  property_id: string;
  org_name: string;
  tenant_name: string | null;
}

function useGlobalProperties() {
  return useQuery({
    queryKey: ['global-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, name, address_line1, property_type, is_active, created_at,
          organisation:organisations(id, name),
          units(id)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address ?? '—',
        property_type: p.property_type,
        is_active: p.is_active,
        unit_count: p.units?.length ?? 0,
        org_name: p.organisation?.name ?? '—',
        org_id: p.organisation?.id ?? '',
        created_at: p.created_at,
      })) as GlobalProperty[];
    },
    staleTime: 30_000,
  });
}

function useGlobalUnits() {
  return useQuery({
    queryKey: ['global-units'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units')
        .select(`
          id, unit_number, unit_type, monthly_rent, status,
          property:properties(id, name,
            organisation:organisations(name)
          ),
          tenancies(
            tenant:users(full_name)
          )
        `)
        .eq('is_active', true)
        .order('status', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((u: any) => {
        const activeTenancy = u.tenancies?.find((t: any) => t.tenant);
        return {
          id: u.id,
          unit_number: u.unit_number,
          unit_type: u.unit_type,
          monthly_rent: u.monthly_rent,
          status: u.status,
          property_name: u.property?.name ?? '—',
          property_id: u.property?.id ?? '',
          org_name: u.property?.organisation?.name ?? '—',
          tenant_name: activeTenancy?.tenant?.full_name ?? null,
        };
      }) as GlobalUnit[];
    },
    staleTime: 30_000,
  });
}

function useOverrideUnitStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ unitId, status }: { unitId: string; status: string }) => {
      const { error } = await supabase.rpc('superadmin_override_unit_status', {
        p_unit_id: unitId,
        p_status: status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['global-units'] });
      toast.success('Unit status updated');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

const UNIT_STATUS_OPTIONS = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];
const UNIT_STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  OCCUPIED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MAINTENANCE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  RESERVED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export default function PropertyControl() {
  const [propSearch, setPropSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [unitStatusTarget, setUnitStatusTarget] = useState<GlobalUnit | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const { data: properties, isLoading: propsLoading, refetch: refetchProps } = useGlobalProperties();
  const { data: units, isLoading: unitsLoading, refetch: refetchUnits } = useGlobalUnits();
  const overrideStatus = useOverrideUnitStatus();

  const filteredProps = (properties ?? []).filter(p => {
    const q = propSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.org_name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
  });

  const filteredUnits = (units ?? []).filter(u => {
    const q = unitSearch.toLowerCase();
    return !q || u.unit_number.toLowerCase().includes(q) || u.property_name.toLowerCase().includes(q) || u.org_name.toLowerCase().includes(q);
  });

  const handleOverride = async () => {
    if (!unitStatusTarget || !newStatus) return;
    await overrideStatus.mutateAsync({ unitId: unitStatusTarget.id, status: newStatus });
    setUnitStatusTarget(null);
    setNewStatus('');
  };

  const stats = {
    totalProps: (properties ?? []).length,
    activeProps: (properties ?? []).filter(p => p.is_active).length,
    totalUnits: (units ?? []).length,
    available: (units ?? []).filter(u => u.status === 'AVAILABLE').length,
    occupied: (units ?? []).filter(u => u.status === 'OCCUPIED').length,
    maintenance: (units ?? []).filter(u => u.status === 'MAINTENANCE').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="h-5 w-5 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Property Control</h1>
        </div>
        <p className="text-slate-400 text-sm">Global registry of all properties and units across every organisation.</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Props', value: stats.totalProps, color: 'text-white' },
          { label: 'Active', value: stats.activeProps, color: 'text-emerald-400' },
          { label: 'Total Units', value: stats.totalUnits, color: 'text-white' },
          { label: 'Available', value: stats.available, color: 'text-emerald-400' },
          { label: 'Occupied', value: stats.occupied, color: 'text-blue-400' },
          { label: 'Maintenance', value: stats.maintenance, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">{label}</p>
              {propsLoading || unitsLoading ? (
                <Skeleton className="h-7 w-10 bg-slate-700" />
              ) : (
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="properties">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="properties" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
            <Building2 className="h-3.5 w-3.5 mr-1.5" /> Properties
          </TabsTrigger>
          <TabsTrigger value="units" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400">
            <Home className="h-3.5 w-3.5 mr-1.5" /> Units
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Properties ─── */}
        <TabsContent value="properties" className="mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by property name, org, or address…"
                    value={propSearch}
                    onChange={e => setPropSearch(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:bg-slate-700" onClick={() => refetchProps()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Property</th>
                      <th className="text-left px-4 py-3">Organisation</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-center px-4 py-3">Units</th>
                      <th className="text-center px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propsLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-700/50">
                          {[1,2,3,4,5].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24 bg-slate-700" /></td>)}
                        </tr>
                      ))
                    ) : filteredProps.map(p => (
                      <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{p.name}</p>
                              <p className="text-slate-500 text-xs flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{p.address}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300 text-xs">{p.org_name}</td>
                        <td className="px-4 py-4">
                          <Badge className="text-[10px] bg-slate-700 text-slate-300 border-slate-600">{p.property_type}</Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-white text-sm font-semibold">{p.unit_count}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {p.is_active ? (
                            <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
                          ) : (
                            <Badge className="text-[10px] bg-slate-600/50 text-slate-400 border-slate-600">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {!propsLoading && filteredProps.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-slate-500 text-sm">No properties match your search</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Units ─── */}
        <TabsContent value="units" className="mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by unit number, property, or org…"
                    value={unitSearch}
                    onChange={e => setUnitSearch(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
                  />
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-400 hover:bg-slate-700" onClick={() => refetchUnits()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Unit</th>
                      <th className="text-left px-4 py-3">Property / Org</th>
                      <th className="text-left px-4 py-3">Tenant</th>
                      <th className="text-right px-4 py-3">Rent (RWF)</th>
                      <th className="text-center px-4 py-3">Status</th>
                      <th className="text-center px-4 py-3">Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitsLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-700/50">
                          {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20 bg-slate-700" /></td>)}
                        </tr>
                      ))
                    ) : filteredUnits.map(u => (
                      <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded bg-slate-700 text-slate-300 flex items-center justify-center">
                              <Home className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{u.unit_number}</p>
                              <p className="text-slate-500 text-xs">{u.unit_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-slate-200 text-xs font-medium">{u.property_name}</p>
                          <p className="text-slate-500 text-xs">{u.org_name}</p>
                        </td>
                        <td className="px-4 py-4">
                          {u.tenant_name ? (
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-300 text-xs">{u.tenant_name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-xs italic">Vacant</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-slate-200 text-xs font-mono">
                          {u.monthly_rent.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className={`text-[10px] ${UNIT_STATUS_STYLES[u.status] ?? 'bg-slate-600/50 text-slate-400 border-slate-600'}`}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] border-purple-500/30 text-purple-400 hover:bg-purple-500/10 px-2"
                            onClick={() => { setUnitStatusTarget(u); setNewStatus(u.status); }}
                          >
                            Override
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!unitsLoading && filteredUnits.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-slate-500 text-sm">No units match your search</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unit Status Override Dialog */}
      <Dialog open={!!unitStatusTarget} onOpenChange={open => { if (!open) { setUnitStatusTarget(null); setNewStatus(''); } }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Home className="h-4 w-4 text-purple-400" /> Override Unit Status
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Force-set the status of unit <strong className="text-white">{unitStatusTarget?.unit_number}</strong> in <strong className="text-white">{unitStatusTarget?.property_name}</strong>.
              An audit log entry will be written.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <p className="text-xs text-slate-400 mb-2">Current status: <Badge className={`ml-1 text-[10px] ${UNIT_STATUS_STYLES[unitStatusTarget?.status ?? ''] ?? ''}`}>{unitStatusTarget?.status}</Badge></p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {UNIT_STATUS_OPTIONS.map(s => (
                    <SelectItem key={s} value={s} className="text-white hover:bg-slate-700">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => { setUnitStatusTarget(null); setNewStatus(''); }}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!newStatus || newStatus === unitStatusTarget?.status || overrideStatus.isPending}
              onClick={handleOverride}
            >
              {overrideStatus.isPending ? 'Saving…' : 'Apply Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
