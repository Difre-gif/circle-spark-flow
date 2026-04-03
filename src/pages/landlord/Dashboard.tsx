import { Building2, Home, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockProperties, mockPayments, mockMaintenanceRequests, weeklyRevenueData, paymentStatusData, formatRWF, formatDate } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const totalUnits = mockProperties.reduce((a, p) => a + p.totalUnits, 0);
const occupiedUnits = mockProperties.reduce((a, p) => a + p.occupiedUnits, 0);
const collectionRate = Math.round((occupiedUnits / totalUnits) * 100);
const totalOutstanding = 420000 + 1200000 + 350000 + 200000;

export default function LandlordDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, here's your property overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Properties" value={String(mockProperties.length)} subtitle={`${mockProperties.filter(p => p.status === 'ACTIVE').length} active`} icon={Building2} trend={{ value: '+1 this month', positive: true }} />
        <StatCard title="Total Units" value={String(totalUnits)} subtitle={`${occupiedUnits} occupied`} icon={Home} />
        <StatCard title="Occupancy Rate" value={`${collectionRate}%`} subtitle={`${totalUnits - occupiedUnits} vacant`} icon={TrendingUp} trend={{ value: '+2.3%', positive: true }} />
        <StatCard title="Outstanding" value={formatRWF(totalOutstanding)} subtitle="4 unpaid invoices" icon={AlertCircle} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Weekly Collections</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatRWF(v)} />
                <Bar dataKey="amount" fill="hsl(222, 72%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Invoice Status</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {paymentStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions + Maintenance */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
                {mockPayments.slice(0, 5).map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.tenantName}</TableCell>
                    <TableCell>{formatRWF(p.amount)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(p.submittedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Maintenance Requests</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead>Unit</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMaintenanceRequests.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.unitNumber}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{m.issue}</TableCell>
                    <TableCell><StatusBadge status={m.priority} /></TableCell>
                    <TableCell><StatusBadge status={m.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
