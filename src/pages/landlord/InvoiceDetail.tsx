import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { mockInvoices, mockPayments, formatRWF, formatDate } from '@/data/mockData';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = mockInvoices.find(i => i.id === id);
  const payments = mockPayments.filter(p => p.invoiceId === id);

  if (!invoice) return <div className="text-center py-12 text-muted-foreground">Invoice not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/landlord/invoices')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">{invoice.period} — {invoice.propertyName}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Tenant</span><span className="font-medium">{invoice.tenantName}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{invoice.unitNumber}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span>{invoice.propertyName}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span>{invoice.period}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{formatDate(invoice.dueDate)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">{formatRWF(invoice.amount)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-bizrent-emerald font-medium">{formatRWF(invoice.amountPaid)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-bold text-lg">{formatRWF(invoice.balance)}</span></div>
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
                    <TableCell className="font-mono text-sm">{p.transactionId}</TableCell>
                    <TableCell>{formatRWF(p.amount)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-sm">{formatDate(p.submittedAt)}</TableCell>
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
