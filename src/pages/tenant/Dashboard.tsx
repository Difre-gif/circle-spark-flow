import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, usePayments, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: invoices, isLoading: invLoading } = useInvoices({ tenantUserId: user?.id });
  const { data: payments, isLoading: payLoading } = usePayments({ tenantUserId: user?.id });

  if (invLoading || payLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const currentInvoice = (invoices ?? []).find(i => i.status === 'DUE' || i.status === 'OVERDUE' || i.status === 'PARTIAL');
  const totalPaid = (payments ?? []).filter(p => p.status === 'APPROVED' || p.status === 'AUTO_APPROVED').reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0] ?? 'Tenant'}</h1>
        <p className="text-muted-foreground">Your rental dashboard</p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <StatCard title="Current Invoice" value={currentInvoice ? formatRWF(currentInvoice.amount_due) : 'None'} subtitle={currentInvoice ? `Due ${formatDate(currentInvoice.due_date)}` : undefined} icon={FileText} />
        <StatCard title="Total Paid" value={formatRWF(totalPaid)} subtitle="All time" icon={CheckCircle} />
      </div>
      {currentInvoice && Number(currentInvoice.balance ?? (currentInvoice.amount_due - currentInvoice.amount_paid)) > 0 && (
        <Card className="border-l-4 border-l-bizrent-amber">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-bizrent-amber" />
              <div>
                <p className="font-medium">Payment Due</p>
                <p className="text-sm text-muted-foreground">{currentInvoice.invoice_number} — {formatRWF(Number(currentInvoice.balance ?? (currentInvoice.amount_due - currentInvoice.amount_paid)))} balance</p>
              </div>
            </div>
            <Button onClick={() => navigate(`/tenant/invoices/${currentInvoice.id}`)}>Pay Now</Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>Transaction</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {(payments ?? []).slice(0, 5).map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.transaction_id ?? '—'}</TableCell>
                  <TableCell>{formatRWF(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.submitted_at)}</TableCell>
                </TableRow>
              ))}
              {(!payments || payments.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
