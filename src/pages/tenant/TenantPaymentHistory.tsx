import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { mockPayments, formatRWF, formatDate } from '@/data/mockData';

export default function TenantPaymentHistory() {
  const myPayments = mockPayments.filter(p => p.tenantId === 't1');

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Payment History</h1><p className="text-muted-foreground">{myPayments.length} payments</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>Transaction ID</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Provider</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {myPayments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.transactionId}</TableCell>
                  <TableCell>{p.invoiceNumber}</TableCell>
                  <TableCell className="font-semibold">{formatRWF(p.amount)}</TableCell>
                  <TableCell>{p.provider.replace('_', ' ')}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.submittedAt)}</TableCell>
                </TableRow>
              ))}
              {myPayments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
