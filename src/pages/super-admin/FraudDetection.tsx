import { useState } from 'react';
import { ShieldAlert, Search, AlertTriangle, CheckCircle2, RefreshCw, Database, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDate } from '@/hooks/useSupabaseData';

interface FraudSignal {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  org_id: string;
  org_name: string;
  detail: string;
  detected_at: string;
}

interface IntegrityIssue {
  table_name: string;
  issue_type: string;
  affected_rows: number;
  detail: string;
}

function useFraudSignals() {
  return useQuery({
    queryKey: ['fraud-signals'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_fraud_signals');
      if (error) throw error;
      return (data ?? []) as FraudSignal[];
    },
    staleTime: 60_000,
  });
}

function useDataIntegrityCheck() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('superadmin_data_integrity_check');
      if (error) throw error;
      return (data ?? []) as IntegrityIssue[];
    },
  });
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export default function FraudDetection() {
  const { data: signals, isLoading, refetch, isFetching } = useFraudSignals();
  const integrityCheck = useDataIntegrityCheck();
  const [integrityResults, setIntegrityResults] = useState<IntegrityIssue[] | null>(null);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);

  const handleIntegrityCheck = async () => {
    try {
      const results = await integrityCheck.mutateAsync();
      setIntegrityResults(results);
      setShowIntegrityModal(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const critical = (signals ?? []).filter(s => s.severity === 'CRITICAL' || s.severity === 'HIGH');
  const medium = (signals ?? []).filter(s => s.severity === 'MEDIUM');
  const low = (signals ?? []).filter(s => s.severity === 'LOW');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <h1 className="text-2xl font-bold text-white">Fraud &amp; Forensics</h1>
          </div>
          <p className="text-slate-400 text-sm">Anomaly detection, integrity checks, and forensic audit tools.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
            onClick={handleIntegrityCheck}
            disabled={integrityCheck.isPending}
          >
            <Database className="h-3.5 w-3.5 mr-1.5" />
            {integrityCheck.isPending ? 'Checking…' : 'Run Integrity Check'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Signals', value: (signals ?? []).length, color: 'text-white', bg: 'bg-slate-800' },
          { label: 'Critical / High', value: critical.length, color: 'text-red-400', bg: critical.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800' },
          { label: 'Medium', value: medium.length, color: 'text-amber-400', bg: 'bg-slate-800' },
          { label: 'Low', value: low.length, color: 'text-blue-400', bg: 'bg-slate-800' },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className={`border-slate-700 ${bg}`}>
            <CardContent className="p-4">
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 bg-slate-700" />
              ) : (
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {critical.length > 0 && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300 text-xs font-medium">
            {critical.length} critical/high severity signal{critical.length !== 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="signals">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="signals" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400">
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Fraud Signals
          </TabsTrigger>
          <TabsTrigger value="patterns" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Pattern Analysis
          </TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-slate-400">
            <Clock className="h-3.5 w-3.5 mr-1.5" /> Event Timeline
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Fraud Signals ─── */}
        <TabsContent value="signals" className="mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Severity</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-left px-4 py-3">Organisation</th>
                      <th className="text-left px-4 py-3">Detail</th>
                      <th className="text-left px-4 py-3">Detected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-700/50">
                          {[1,2,3,4,5].map(j => (
                            <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24 bg-slate-700" /></td>
                          ))}
                        </tr>
                      ))
                    ) : (signals ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
                          <p className="text-slate-400 text-sm">No fraud signals detected</p>
                          <p className="text-slate-600 text-xs mt-1">All clear — system looks healthy</p>
                        </td>
                      </tr>
                    ) : (
                      [...(signals ?? [])].sort((a, b) => {
                        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
                      }).map((s, i) => (
                        <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="px-6 py-3">
                            <Badge className={`text-[10px] ${SEVERITY_STYLES[s.severity] ?? 'bg-slate-600/50 text-slate-300 border-slate-600'}`}>
                              {s.severity}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-[10px] bg-slate-900/50 text-red-300 px-2 py-0.5 rounded">{s.type}</code>
                          </td>
                          <td className="px-4 py-3 text-white text-xs font-medium">{s.org_name}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{s.detail}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">{formatDate(s.detected_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Pattern Analysis ─── */}
        <TabsContent value="patterns" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Payment Velocity Anomalies',
                desc: 'Orgs with >3 payments approved within 5 minutes — potential automated abuse or double-processing.',
                status: 'Active',
                statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              },
              {
                title: 'Tenant Churn Spike',
                desc: 'Orgs that removed >50% of their tenants within 7 days — potential data misuse or platform exit.',
                status: 'Active',
                statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              },
              {
                title: 'Invoice Amount Outliers',
                desc: 'Invoices where amount is >5× the org\'s average rent — potential test records or data entry errors.',
                status: 'Active',
                statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              },
              {
                title: 'Ghost Debt Wipe Pattern',
                desc: 'More than 2 debt wipes on the same org within 30 days — possible abuse of Super Admin override.',
                status: 'Active',
                statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              },
              {
                title: 'Dormant Org Reactivation',
                desc: 'Orgs with zero activity for 60+ days that suddenly have high transaction volume.',
                status: 'v2 — ML model required',
                statusColor: 'bg-slate-600/50 text-slate-400 border-slate-600',
              },
              {
                title: 'Cross-Org Tenant Overlap',
                desc: 'Tenants enrolled in multiple orgs simultaneously — identify shared identity fraud.',
                status: 'v2 — graph analysis',
                statusColor: 'bg-slate-600/50 text-slate-400 border-slate-600',
              },
            ].map(({ title, desc, status, statusColor }) => (
              <Card key={title} className="bg-slate-800 border-slate-700">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{title}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
                    </div>
                    <Badge className={`text-[9px] whitespace-nowrap shrink-0 ${statusColor}`}>{status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Tab 3: Event Timeline ─── */}
        <TabsContent value="timeline" className="mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Recent High-Risk Events</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-4 w-4 rounded-full bg-slate-700 mt-1 shrink-0" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-48 bg-slate-700" />
                        <Skeleton className="h-3 w-32 bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (signals ?? []).filter(s => s.severity !== 'LOW').length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-slate-400 text-sm">No high-risk events in the timeline</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...(signals ?? [])].filter(s => s.severity !== 'LOW').slice(0, 20).map((s, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                        s.severity === 'CRITICAL' ? 'bg-red-500' :
                        s.severity === 'HIGH' ? 'bg-orange-500' :
                        'bg-amber-500'
                      }`} />
                      <div>
                        <p className="text-white text-sm font-medium">{s.org_name} — <code className="text-[11px] text-slate-300">{s.type}</code></p>
                        <p className="text-slate-400 text-xs">{s.detail}</p>
                        <p className="text-slate-600 text-xs font-mono mt-0.5">{formatDate(s.detected_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Integrity Results Modal */}
      <Dialog open={showIntegrityModal} onOpenChange={setShowIntegrityModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-400" /> Data Integrity Check Results
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Full scan of referential integrity, orphaned records, and data consistency across all tables.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {(integrityResults ?? []).length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
                <p className="text-emerald-400 font-medium">All checks passed</p>
                <p className="text-slate-400 text-sm mt-1">No integrity issues found in the database</p>
              </div>
            ) : (
              (integrityResults ?? []).map((issue, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">{issue.table_name}</code>
                      <Badge className="text-[9px] bg-red-500/20 text-red-400 border-red-500/30">{issue.issue_type}</Badge>
                    </div>
                    <span className="text-xs text-slate-400">{issue.affected_rows} row{issue.affected_rows !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-slate-300 text-xs">{issue.detail}</p>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setShowIntegrityModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
