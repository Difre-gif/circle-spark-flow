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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's your property overview</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Properties" value={String(stats?.totalProperties ?? 0)} subtitle={`${stats?.totalUnits ?? 0} units`} icon={Building2} />
        <StatCard title="Total Units" value={String(stats?.totalUnits ?? 0)} subtitle={`${stats?.occupiedUnits ?? 0} occupied`} icon={Home} />
        <StatCard title="Collection Rate" value={`${stats?.collectionRate ?? 0}%`} subtitle={`${stats?.vacantUnits ?? 0} vacant`} icon={TrendingUp} />
        <StatCard title="Outstanding" value={formatRWF(stats?.outstanding ?? 0)} subtitle={`${stats?.pendingPayments ?? 0} pending payments`} icon={AlertCircle} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Invoice Status</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {paymentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {paymentStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12">No invoice data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Pending Payments</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-3xl font-bold">{stats?.pendingPayments ?? 0}</p>
              <p className="text-sm text-muted-foreground">awaiting review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Tenant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recentPayments ?? []).slice(0, 5).map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{(p.tenant as any)?.full_name ?? '—'}</TableCell>
                  <TableCell>{formatRWF(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(p.submitted_at)}</TableCell>
                </TableRow>
              ))}
              {(!recentPayments || recentPayments.length === 0) && (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
