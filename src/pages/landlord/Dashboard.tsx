import { Building2, Home, TrendingUp, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboardStats, usePayments, useInvoices, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function LandlordDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentPayments, isLoading: paymentsLoading } = usePayments();
  const { data: invoices } = useInvoices();

  const isLoading = statsLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" />
      </div>
    );
  }

  const paymentStatusData = (() => {
    if (!invoices) return [];
    const counts: Record<string, number> = { PAID: 0, PARTIAL: 0, OVERDUE: 0, DUE: 0 };
    invoices.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });
    return [
      { name: 'Paid', value: counts.PAID, fill: 'hsl(160, 84%, 39%)' },
      { name: 'Partial', value: counts.PARTIAL, fill: 'hsl(38, 92%, 50%)' },
      { name: 'Overdue', value: counts.OVERDUE, fill: 'hsl(0, 79%, 50%)' },
      { name: 'Due', value: counts.DUE, fill: 'hsl(222, 72%, 48%)' },
    ].filter(d => d.value > 0);
  })();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Welcome back, here's an overview of your property portfolio</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Properties" value={String(stats?.totalProperties ?? 0)} subtitle={`${stats?.totalUnits ?? 0} units registered`} icon={Building2} />
        <StatCard title="Total Units" value={String(stats?.totalUnits ?? 0)} subtitle={`${stats?.occupiedUnits ?? 0} units occupied`} icon={Home} />
        <StatCard title="Collection Rate" value={`${stats?.collectionRate ?? 0}%`} subtitle={`${stats?.vacantUnits ?? 0} vacant units`} icon={TrendingUp} />
        <StatCard title="Outstanding" value={formatRWF(stats?.outstanding ?? 0)} subtitle={`${stats?.pendingPayments ?? 0} pending payments`} icon={AlertCircle} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-bizrent-navy">Invoice Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            {paymentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={paymentStatusData} 
                    cx="50%" cy="50%" 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="value" 
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {paymentStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} strokeWidth={2} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <p>No invoice data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-white to-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-bizrent-navy">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bizrent-amber/10 mb-4 ring-8 ring-bizrent-amber/5">
                <CreditCard className="h-10 w-10 text-bizrent-amber" />
              </div>
              <p className="text-5xl font-extrabold text-bizrent-navy mb-2">{stats?.pendingPayments ?? 0}</p>
              <p className="text-base font-medium text-muted-foreground">Payments awaiting review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="text-lg font-bold text-bizrent-navy">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-bizrent-navy">Tenant</TableHead>
                <TableHead className="font-semibold text-bizrent-navy">Amount</TableHead>
                <TableHead className="font-semibold text-bizrent-navy">Status</TableHead>
                <TableHead className="font-semibold text-bizrent-navy">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recentPayments ?? []).slice(0, 5).map(p => (
                <TableRow key={p.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium text-bizrent-slate">{(p.tenant as any)?.full_name ?? '—'}</TableCell>
                  <TableCell className="font-medium">{formatRWF(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.submitted_at)}</TableCell>
                </TableRow>
              ))}
              {(!recentPayments || recentPayments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No payments yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}