import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useInvoice, useSubmitPayment, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { FileUpload } from '@/components/ui/file-upload';
import { paymentProofSchema, PaymentProofFormValues } from '@/lib/validations/payments.schema';

export default function TenantInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const submitPayment = useSubmitPayment();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<PaymentProofFormValues>({
    resolver: zodResolver(paymentProofSchema),
    defaultValues: {
      payment_method: 'MOMO',
      transaction_id: '',
      amount: 0,
      proof_file: undefined, // ensure it's undefined
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (invoice) {
      const balance = Number(invoice.balance ?? (invoice.amount_due - invoice.amount_paid));
      form.reset({
        payment_method: 'MOMO',
        transaction_id: '',
        amount: balance > 0 ? balance : 0,
      });
    }
  }, [invoice, form]);

  const onSubmit = async (data: PaymentProofFormValues) => {
    try {
      await submitPayment.mutateAsync({
        invoice_id: invoice?.id,
        amount: data.amount,
        payment_method: data.payment_method,
        transaction_id: data.transaction_id,
        proof_file: data.proof_file ?? undefined,
      });
      setSubmitted(true);
    } catch {}
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!invoice) return <div className="text-center py-12 text-muted-foreground">Invoice not found</div>;

  const balance = Number(invoice.balance ?? (invoice.amount_due - invoice.amount_paid));

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
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
          <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span className="font-medium">{(invoice.unit as any)?.property?.name ?? '—'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span className="font-medium">{(invoice.unit as any)?.unit_number ?? '—'}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-lg">{formatRWF(invoice.amount_due)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-bizrent-emerald font-medium">{formatRWF(invoice.amount_paid)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-bold text-lg">{formatRWF(balance)}</span></div>
          <Separator />
          <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="font-medium">{formatDate(invoice.due_date)}</span></div>
        </CardContent>
      </Card>

      {balance > 0 && !submitted && (
        <Card className="border-t-4 border-t-bizrent-blue shadow-md">
          <CardHeader>
            <CardTitle>Submit Payment</CardTitle>
            <p className="text-sm text-muted-foreground">Pay via Mobile Money, then enter your transaction details below.</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MOMO">MTN MoMo</SelectItem>
                          <SelectItem value="MPESA">M-Pesa</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="transaction_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input placeholder={form.watch("payment_method") === "MOMO" ? "e.g. MP26040100001234" : "e.g. BT-123456789"} className="font-mono uppercase" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      {form.watch("payment_method") === "MOMO" && (
                        <FormDescription>
                          Enter the code from your MoMo confirmation SMS. Tap the SMS to copy.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid (RWF)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="font-mono font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="proof_file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Payment Screenshot {form.watch("payment_method") === "MOMO" ? "(Optional)" : "(*Required)"}</FormLabel>
                      <FormControl>
                        <FileUpload 
                          value={value} 
                          onChange={onChange}
                          maxSizeMB={5}
                          accept="image/jpeg,image/png,application/pdf"
                          label=""
                          error={form.formState.errors.proof_file?.message as string}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-bizrent-navy hover:bg-bizrent-blue text-white" disabled={submitPayment.isPending || !form.formState.isValid}>
                  {submitPayment.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Submit Payment Proof</>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {submitted && (
        <Card className="border-l-4 border-l-bizrent-emerald bg-emerald-50/50">
          <CardContent className="p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-bizrent-emerald/10 flex items-center justify-center mb-6">
              <Send className="h-8 w-8 text-bizrent-emerald" />
            </div>
            <p className="font-bold text-2xl text-bizrent-navy">Payment Submitted!</p>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Your payment has been submitted and is waiting for your landlord to review. You'll receive a confirmation once it's approved.
            </p>
            <Button variant="outline" className="mt-8" onClick={() => navigate('/tenant')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
