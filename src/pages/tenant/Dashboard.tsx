import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
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

  if (invLoading || payLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  const currentInvoice = (invoices ?? []).find(i => i.status === 'DUE' || i.status === 'OVERDUE' || i.status === 'PARTIAL');
  const totalPaid = (payments ?? []).filter(p => p.status === 'APPROVED' || p.status === 'AUTO_APPROVED').reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title text-2xl">Welcome back, {user?.name?.split(' ')[0] ?? 'Tenant'}</h1>
          <p className="page-description text-sm">Here is your rental and payment overview.</p>
        </div>
      </div>

      {currentInvoice && Number(currentInvoice.balance ?? (currentInvoice.amount_due - currentInvoice.amount_paid)) > 0 && (
        <Card className="border-l-4 border-l-bizrent-amber shadow-md bg-gradient-to-r from-amber-50 to-white">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-bizrent-amber/10 rounded-full">
                <AlertCircle className="h-6 w-6 text-bizrent-amber" />
              </div>
              <div>
                <p className="text-lg font-bold text-bizrent-navy">Payment Due</p>
                <p className="text-sm text-muted-foreground font-medium">
                  Invoice {currentInvoice.invoice_number} · <span className="text-bizrent-slate">{formatRWF(Number(currentInvoice.balance ?? (currentInvoice.amount_due - currentInvoice.amount_paid)))} balance</span>
                </p>
                <p className="text-xs text-bizrent-red mt-1 font-semibold">Due on {formatDate(currentInvoice.due_date)}</p>
              </div>
            </div>
            <Button size="lg" className="w-full sm:w-auto bg-bizrent-amber hover:bg-amber-600 text-white font-bold" onClick={() => navigate(`/tenant/invoices/${currentInvoice.id}`)}>
              Pay Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <StatCard title="Current Invoice" value={currentInvoice ? formatRWF(currentInvoice.amount_due) : 'All Paid'} subtitle={currentInvoice ? `Due ${formatDate(currentInvoice.due_date)}` : 'No pending dues'} icon={FileText} />
        <StatCard title="Total Paid" value={formatRWF(totalPaid)} subtitle="Lifetime rental payments" icon={CheckCircle} />
      </div>
      
      <Card className="shadow-sm border-border/50">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="text-lg font-bold text-bizrent-navy flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-bizrent-blue" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-bizrent-navy py-4">Transaction ID</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Amount</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Status</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments ?? []).slice(0, 5).map(p => (
                <TableRow key={p.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-mono text-sm text-bizrent-slate">{p.transaction_id ?? '—'}</TableCell>
                  <TableCell className="font-semibold">{formatRWF(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">{formatDate(p.submitted_at)}</TableCell>
                </TableRow>
              ))}
              {(!payments || payments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    You haven't made any payments yet.
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