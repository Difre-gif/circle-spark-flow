import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockInvoices, formatRWF, formatDate } from '@/data/mockData';

export default function TenantInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = mockInvoices.find(i => i.id === id);
  const [txId, setTxId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!invoice) return <div className="text-center py-12 text-muted-foreground">Invoice not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenant/invoices')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground">{invoice.period}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <Card>
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span>{invoice.propertyName}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{invoice.unitNumber}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">{formatRWF(invoice.amount)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-bizrent-emerald">{formatRWF(invoice.amountPaid)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-bold text-lg">{formatRWF(invoice.balance)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{formatDate(invoice.dueDate)}</span></div>
        </CardContent>
      </Card>

      {invoice.balance > 0 && !submitted && (
        <Card>
          <CardHeader><CardTitle>Submit Payment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Pay via Mobile Money, then enter your transaction details below.</p>
            <div className="space-y-2">
              <Label>Payment Provider</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent><SelectItem value="MTN_MOMO">MTN MoMo</SelectItem><SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem><SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>MoMo Transaction ID</Label>
              <Input placeholder="e.g. MOMO-12345678" value={txId} onChange={e => setTxId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount (RWF)</Label>
              <Input type="number" defaultValue={invoice.balance} />
            </div>
            <div className="space-y-2">
              <Label>Payment Screenshot</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => setSubmitted(true)} disabled={!txId}>
              <Send className="mr-2 h-4 w-4" /> Submit Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {submitted && (
        <Card className="border-l-4 border-l-bizrent-emerald">
          <CardContent className="p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-bizrent-emerald/10 flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-bizrent-emerald" />
            </div>
            <p className="font-semibold text-lg">Payment Submitted!</p>
            <p className="text-sm text-muted-foreground mt-1">Your landlord will review and verify your payment shortly.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
