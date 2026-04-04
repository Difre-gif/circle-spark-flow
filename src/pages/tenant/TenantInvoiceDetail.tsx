import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoice, useSubmitPayment, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function TenantInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const submitPayment = useSubmitPayment();
  const [txId, setTxId] = useState('');
  const [method, setMethod] = useState('MOMO');
  const [amount, setAmount] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!invoice) return <div className="text-center py-12 text-muted-foreground">Invoice not found</div>;

  const balance = Number(invoice.balance ?? (invoice.amount_due - invoice.amount_paid));
  const payAmount = amount ?? balance;

  const handleSubmit = async () => {
    if (!txId.trim()) return;
    try {
      await submitPayment.mutateAsync({
        invoice_id: invoice.id,
        amount: payAmount,
        payment_method: method,
        transaction_id: txId,
        proof_file: file ?? undefined,
      });
      setSubmitted(true);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenant/invoices')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground">{(invoice.unit as any)?.property?.name ?? ''}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <Card>
        <CardHeader><CardTitle>Invoice Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span>{(invoice.unit as any)?.property?.name ?? '—'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{(invoice.unit as any)?.unit_number ?? '—'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">{formatRWF(invoice.amount_due)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-bizrent-emerald">{formatRWF(invoice.amount_paid)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-bold text-lg">{formatRWF(balance)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{formatDate(invoice.due_date)}</span></div>
        </CardContent>
      </Card>

      {balance > 0 && !submitted && (
        <Card>
          <CardHeader><CardTitle>Submit Payment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Pay via Mobile Money, then enter your transaction details below.</p>
            <div className="space-y-2">
              <Label>Payment Provider</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOMO">MTN MoMo</SelectItem>
                  <SelectItem value="MPESA">M-Pesa</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction ID</Label>
              <Input placeholder="e.g. MOMO-12345678" value={txId} onChange={e => setTxId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Amount (RWF)</Label>
              <Input type="number" value={payAmount} onChange={e => setAmount(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Payment Screenshot</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => fileRef.current?.click()}>
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{file ? file.name : 'Click to upload or drag & drop'}</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={!txId.trim() || submitPayment.isPending}>
              <Send className="mr-2 h-4 w-4" /> {submitPayment.isPending ? 'Submitting...' : 'Submit Payment'}
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
