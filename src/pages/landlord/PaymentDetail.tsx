import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePayment, useApprovePayment, useRejectPayment, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { formatPaymentMethod } from '@/lib/paymentMethods';

export default function PaymentDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payment, isLoading } = usePayment(id);
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  useEffect(() => {
    if (payment?.proof) {
      const proof = payment.proof as any;
      if (proof?.file_path && proof?.bucket) {
        supabase.storage
          .from(proof.bucket)
          .createSignedUrl(proof.file_path, 300)
          .then(({ data }) => {
            if (data?.signedUrl) setProofUrl(data.signedUrl);
          });
      }
    }
  }, [payment]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!payment) return <div className="text-center py-12 text-muted-foreground">{t('legacy.paymentNotFound')}</div>;

  const handleApprove = async () => {
    await approvePayment.mutateAsync(payment.id);
    navigate('/landlord/payments');
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    await rejectPayment.mutateAsync({ paymentId: payment.id, reason });
    setRejectOpen(false);
    navigate('/landlord/payments');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/landlord/payments')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t('legacy.paymentReview')}</h1>
          <p className="text-muted-foreground">{payment.transaction_id ?? '—'}</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('legacy.paymentDetails')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.tenant')}</span><span className="font-medium">{(payment.tenant as any)?.full_name ?? '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.invoice')}</span><span className="text-primary font-medium">{(payment.invoice as any)?.invoice_number ?? '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.amount')}</span><span className="text-xl font-bold text-bizrent-navy dark:text-white font-mono">{formatRWF(payment.amount)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.method')}</span><span>{formatPaymentMethod(payment.payment_method)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.transactionId')}</span><span className="font-mono">{payment.transaction_id ?? '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.submitted')}</span><span>{formatDate(payment.submitted_at)}</span></div>
            {payment.reviewed_at && <>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.reviewed')}</span><span>{formatDate(payment.reviewed_at)}</span></div>
            </>}
            {payment.reviewer && <>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.reviewedBy')}</span><span>{(payment.reviewer as any)?.full_name ?? '—'}</span></div>
            </>}
            {payment.rejection_reason && <>
              <Separator />
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('legacy.rejectionReason')}</p>
                <p className="text-sm bg-destructive/10 text-destructive rounded-md p-3">{payment.rejection_reason}</p>
              </div>
            </>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('legacy.paymentProof')}</CardTitle></CardHeader>
          <CardContent>
            {proofUrl ? (
              <img src={proofUrl} alt="Payment proof" className="rounded-lg border max-h-96 w-full object-contain" />
            ) : (
              <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">{t('legacy.noScreenshotUploaded')}</p>
                  <p className="text-xs mt-1">{t('legacy.proofImageWillAppearHere')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {payment.status === 'PENDING' && (
        <div className="flex gap-3 justify-end">
          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setRejectOpen(true)}>
            <XCircle className="mr-2 h-4 w-4" /> {t('legacy.rejectPayment')}
          </Button>
          <Button className="bg-bizrent-emerald hover:bg-bizrent-emerald/90" onClick={handleApprove} disabled={approvePayment.isPending}>
            <CheckCircle className="mr-2 h-4 w-4" /> {approvePayment.isPending ? 'Approving...' : 'Approve Payment'}
          </Button>
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('legacy.rejectPayment')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('legacy.pleaseProvideAReasonForRejectingThisPaymentTheTenantWillBeNotified')}</p>
            <div className="space-y-2"><Label>{t('legacy.reason')}</Label><Textarea placeholder="e.g. Transaction ID does not match MoMo records" value={reason} onChange={e => setReason(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>{t('legacy.cancel')}</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectPayment.isPending || !reason.trim()}>
              {rejectPayment.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
