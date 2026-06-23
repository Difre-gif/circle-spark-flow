import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Smartphone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/StatusBadge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useInvoice, useSubmitPayment, usePayments, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { FileUpload } from '@/components/ui/file-upload';
import { paymentProofSchema, PaymentProofFormValues } from '@/lib/validations/payments.schema';
import { getMobileMoneyContext } from '@/lib/paymentMethods';
import { toast } from 'sonner';

export default function TenantInvoiceDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, orgCountry, orgCurrency } = useAuth();
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: payments, isLoading: paymentsLoading } = usePayments({ tenantUserId: user?.id });
  const submitPayment = useSubmitPayment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mobileMoney = getMobileMoneyContext({ countryCode: orgCountry, currencyCode: orgCurrency });
  const paymentMethods = [
    {
      value: mobileMoney.method,
      label: mobileMoney.label,
      description: mobileMoney.description,
      icon: Smartphone,
    },
    {
      value: 'BANK_TRANSFER',
      label: 'Bank Transfer',
      description: 'Pay via bank and attach proof',
      icon: Building2,
    },
  ];

  const form = useForm<PaymentProofFormValues>({
    resolver: zodResolver(paymentProofSchema),
    defaultValues: {
      payment_method: mobileMoney.method,
      transaction_id: '',
      amount: 0,
      proof_file: undefined,
    },
    mode: 'onChange',
  });

  const selectedMethod = form.watch('payment_method');

  useEffect(() => {
    if (invoice) {
      const balance = Number(invoice.balance ?? (invoice.amount_due - invoice.amount_paid));
      form.reset({
        payment_method: mobileMoney.method,
        transaction_id: '',
        amount: balance > 0 ? balance : 0,
      });
    }
  }, [invoice, form, mobileMoney.method]);

  const onSubmit = async (data: PaymentProofFormValues) => {
    if (isSubmitting) return; // prevent double-submit
    setIsSubmitting(true);
    try {
      await submitPayment.mutateAsync({
        invoice_id: invoice?.id,
        amount: data.amount,
        payment_method: data.payment_method,
        transaction_id: data.transaction_id,
        proof_file: data.proof_file ?? undefined,
      });
      toast.success(
        "Your payment has been submitted. It's waiting for your landlord to review — you'll receive a confirmation once it's approved.",
        { duration: 6000 }
      );
      navigate('/tenant/payments', { replace: true });
    } catch (err: any) {
      const isIdempotency = err?.code === '23505' || err?.status === 409;
      if (isIdempotency) {
        toast.error(
          'This transaction ID has already been submitted. If you believe this is an error, contact your landlord.',
          { duration: 8000 }
        );
        navigate('/tenant/payments', { replace: true });
      }
      // other errors handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-[#64748B]">
        {t('legacy.thatPageDoesnTExistIfYouFollowedALinkItMayHaveExpired')}
      </div>
    );
  }

  const balance = Number(invoice.balance ?? (invoice.amount_due - invoice.amount_paid));
  const submittedPayment = (payments ?? []).find(payment =>
    payment.invoice_id === invoice.id &&
    ['PENDING', 'APPROVED', 'AUTO_APPROVED'].includes(payment.status)
  );
  const canPay = balance > 0 && !['PAID', 'CANCELLED'].includes(invoice.status) && !paymentsLoading && !submittedPayment;
  const invoiceKind = invoice.invoice_type === 'DEPOSIT' ? 'Security Deposit' : 'Rent Invoice';

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Back + title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px] rounded-[6px]"
          onClick={() => navigate('/tenant/invoices')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1E3A8A]">{invoice.invoice_number}</h1>
          <p className="text-[#64748B] text-sm">{(invoice.unit as any)?.property?.name ?? ''}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Invoice summary */}
      <Card className="border border-[#E2E8F0] rounded-[8px] shadow-card bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#1E3A8A]">{invoiceKind} Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">Type</span>
            <span className="font-medium text-[#0F172A]">{invoiceKind}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">{t('legacy.property')}</span>
            <span className="font-medium text-[#0F172A]">{(invoice.unit as any)?.property?.name ?? '—'}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">{t('legacy.unit')}</span>
            <span className="font-medium text-[#0F172A]">{(invoice.unit as any)?.unit_number ?? '—'}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">{t('legacy.period')}</span>
            <span className="font-medium text-[#0F172A]">{invoice.period_label ?? formatDate(invoice.due_date)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-baseline">
            <span className="text-[#64748B] text-sm">{t('legacy.amountDue')}</span>
            <span className="font-mono font-bold text-2xl text-[#1E3A8A]">{formatRWF(invoice.amount_due)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">{t('legacy.paid')}</span>
            <span className="font-mono font-semibold text-[#10B981]">{formatRWF(invoice.amount_paid)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-baseline">
            <span className="text-[#64748B] text-sm font-semibold">{t('legacy.balance')}</span>
            <span className="font-mono font-bold text-xl text-[#1E3A8A]">{formatRWF(balance)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">{t('legacy.dueDate')}</span>
            <span className="font-medium text-[#0F172A]">{formatDate(invoice.due_date)}</span>
          </div>
        </CardContent>
      </Card>

      {paymentsLoading && balance > 0 && !['PAID', 'CANCELLED'].includes(invoice.status) && (
        <Card className="border border-[#E2E8F0] rounded-[8px] shadow-card bg-card">
          <CardContent className="py-8 flex items-center justify-center gap-3 text-[#64748B]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking payment status...
          </CardContent>
        </Card>
      )}

      {submittedPayment && (
        <Card className="border border-[#BBF7D0] bg-[#F0FDF4] rounded-[8px] shadow-card">
          <CardContent className="p-6 space-y-3">
            <p className="font-semibold text-[#166534]">Payment proof already submitted</p>
            <p className="text-sm text-[#166534]/80">
              Your {submittedPayment.payment_method === 'BANK_TRANSFER' ? 'bank transfer' : mobileMoney.label} payment is currently marked as {submittedPayment.status.toLowerCase().replace('_', ' ')}. You do not need to submit it again.
            </p>
            <Button className="bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white" onClick={() => navigate('/tenant/payments')}>
              View Payment History
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment form */}
      {canPay && (
        <Card className="border-t-4 border-t-[#1D4ED8] border border-[#E2E8F0] rounded-[8px] shadow-card bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#1E3A8A]">{t('legacy.submitPayment')}</CardTitle>
            <p className="text-sm text-[#64748B]">
              {mobileMoney.submitCopy}
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Step 1 — Payment method */}
                <div>
                  <p className="text-sm font-semibold text-[#0F172A] mb-3">{t('legacy.howDidYouPay')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map(({ value, label, description, icon: Icon }) => {
                      const isSelected = selectedMethod === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => form.setValue('payment_method', value as any, { shouldValidate: true })}
                          className={cn(
                            'flex flex-col items-start gap-2 p-4 rounded-[8px] border-2 text-left transition-colors min-h-[80px]',
                            isSelected
                              ? 'border-[#1E3A8A] bg-[#EFF6FF]'
                              : 'border-[#E2E8F0] bg-card hover:border-[#1D4ED8] hover:bg-[#F8FAFC]'
                          )}
                        >
                          <div className={cn(
                            'p-2 rounded-[6px]',
                            isSelected ? 'bg-[#1E3A8A] text-white' : 'bg-[#F8FAFC] text-[#1E3A8A]'
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className={cn('text-sm font-semibold', isSelected ? 'text-[#1E3A8A]' : 'text-[#0F172A]')}>
                              {label}
                            </p>
                            <p className="text-xs text-[#64748B]">{description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 — Transaction ID (optional) */}
                <FormField
                  control={form.control}
                  name="transaction_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-[#0F172A]">
                        {selectedMethod === 'BANK_TRANSFER' ? 'Bank Reference Number' : mobileMoney.transactionLabel}{' '}
                        <span className="font-normal text-[#64748B]">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={selectedMethod === 'BANK_TRANSFER' ? 'e.g. BT-123456789' : mobileMoney.placeholder}
                          className="font-mono uppercase h-11 border-[#E2E8F0] focus-visible:ring-[#1D4ED8] text-[#0F172A]"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-[#64748B]">
                        {selectedMethod !== 'BANK_TRANSFER'
                          ? mobileMoney.helpText
                          : 'Your bank transfer reference number. Leave blank if unsure.'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Screenshot upload — required */}
                <FormField
                  control={form.control}
                  name="proof_file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-[#0F172A]">
                        Payment Screenshot <span className="text-red-500">*</span>
                      </FormLabel>
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

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-[6px]"
                  style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, fontSize: '14px' }}
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('legacy.submitting')}</>
                  ) : (
                    'Submit Payment Proof'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
