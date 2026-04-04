import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function TenantPaymentHistory() {
  const { user } = useAuth();
  const { data: payments, isLoading } = usePayments({ tenantUserId: user?.id });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Payment History</h1><p className="text-muted-foreground">{payments?.length ?? 0} payments</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>Transaction ID</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {(payments ?? []).map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.transaction_id ?? '—'}</TableCell>
                  <TableCell>{(p.invoice as any)?.invoice_number ?? '—'}</TableCell>
                  <TableCell className="font-semibold">{formatRWF(p.amount)}</TableCell>
                  <TableCell>{p.payment_method?.replace('_', ' ')}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.submitted_at)}</TableCell>
                </TableRow>
              ))}
              {(!payments || payments.length === 0) && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
