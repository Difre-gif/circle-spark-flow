import { CreditCard, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockInvoices, mockPayments, formatRWF, formatDate } from '@/data/mockData';

export default function TenantDashboard() {
  const navigate = useNavigate();
  // Filter for tenant t1 (Alice)
  const myInvoices = mockInvoices.filter(i => i.tenantId === 't1');
  const myPayments = mockPayments.filter(p => p.tenantId === 't1');
  const currentInvoice = myInvoices.find(i => i.period === 'April 2026');
  const totalPaid = myPayments.filter(p => p.status === 'APPROVED').reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, Alice</h1>
        <p className="text-muted-foreground">Your rental dashboard</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <StatCard title="Current Invoice" value={currentInvoice ? formatRWF(currentInvoice.amount) : 'None'} subtitle={currentInvoice?.period} icon={FileText} />
        <StatCard title="Total Paid" value={formatRWF(totalPaid)} subtitle="This year" icon={CheckCircle} />
      </div>

      {currentInvoice && currentInvoice.balance > 0 && (
        <Card className="border-l-4 border-l-bizrent-amber">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-bizrent-amber" />
              <div>
                <p className="font-medium">Payment Due</p>
                <p className="text-sm text-muted-foreground">{currentInvoice.invoiceNumber} — {formatRWF(currentInvoice.balance)} balance</p>
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
              {myPayments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.transactionId}</TableCell>
                  <TableCell>{formatRWF(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.submittedAt)}</TableCell>
                </TableRow>
              ))}
              {myPayments.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
