import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { useInvoice, usePayments, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: allPayments } = usePayments();
  const payments = (allPayments ?? []).filter(p => p.invoice_id === id);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!invoice) return <div className="text-center py-12 text-muted-foreground">Invoice not found</div>;

  const balance = Number(invoice.balance ?? (invoice.amount_due - invoice.amount_paid));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/landlord/invoices')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground">{(invoice.unit as any)?.property?.name ?? ''}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Tenant</span><span className="font-medium">{(invoice.tenant as any)?.full_name ?? '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{(invoice.unit as any)?.unit_number ?? '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span>{(invoice.unit as any)?.property?.name ?? '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{formatDate(invoice.due_date)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">{formatRWF(invoice.amount_due)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-bizrent-emerald font-medium">{formatRWF(invoice.amount_paid)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-bold text-lg">{formatRWF(balance)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow className="bg-primary/5"><TableHead>Transaction ID</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payments recorded yet</TableCell></TableRow>
                ) : payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.transaction_id ?? '—'}</TableCell>
                    <TableCell>{formatRWF(p.amount)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-sm">{formatDate(p.submitted_at)}</TableCell>
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
