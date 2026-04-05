import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { CheckCircle, XCircle, CreditCard, Loader2, Copy, Check, Eye } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { usePayments, useApprovePayment, useRejectPayment, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function PendingPayments() {
  const navigate = useNavigate();
  const { data: pendingPayments, isLoading: pendingLoading } = usePayments({ status: 'PENDING' });
  const { data: allPayments, isLoading: allLoading } = usePayments();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; paymentId: string | null }>({ open: false, paymentId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const approvedCount = (allPayments ?? []).filter(p => p.status === 'APPROVED' || p.status === 'AUTO_APPROVED').length;
  const rejectedCount = (allPayments ?? []).filter(p => p.status === 'REJECTED').length;

  const isLoading = pendingLoading || allLoading;

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const handleCopy = async (txId: string) => {
    await navigator.clipboard.writeText(txId);
    setCopiedId(txId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      await approvePayment.mutateAsync(paymentId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.paymentId || rejectReason.length < 10) return;
    setProcessingId(rejectModal.paymentId);
    try {
      await rejectPayment.mutateAsync({ paymentId: rejectModal.paymentId, reason: rejectReason });
      setRejectModal({ open: false, paymentId: null });
      setRejectReason('');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments Queue</h1>
        <p className="text-muted-foreground">Review and process tenant payment submissions</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard title="Pending Review" value={String((pendingPayments ?? []).length)} icon={CreditCard} className="border-l-4 border-l-bizrent-amber" />
        <StatCard title="Approved" value={String(approvedCount)} icon={CheckCircle} className="border-l-4 border-l-bizrent-emerald" />
        <StatCard title="Rejected" value={String(rejectedCount)} icon={XCircle} className="border-l-4 border-l-bizrent-red" />
      </div>

      {(pendingPayments ?? []).length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Awaiting Your Review</h2>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {(pendingPayments ?? []).map(p => (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">{(p.tenant as any)?.full_name ?? '—'}</p>
                      <p className="text-sm text-muted-foreground">
                        {(p.invoice as any)?.invoice_number ?? '—'} · {p.payment_method?.replace('_', ' ')}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="text-2xl font-bold font-mono">{formatRWF(p.amount)}</div>

                  {p.transaction_id && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">TX:</span>
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{p.transaction_id}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(p.transaction_id!)}>
                        {copiedId === p.transaction_id ? <Check className="h-3 w-3 text-bizrent-emerald" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(p.submitted_at), { addSuffix: true })}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-bizrent-emerald hover:bg-bizrent-forest text-white"
                      disabled={processingId === p.id}
                      onClick={() => handleApprove(p.id)}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      disabled={processingId === p.id}
                      onClick={() => setRejectModal({ open: true, paymentId: p.id })}
                    >
                      <XCircle className="mr-1 h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-bizrent-emerald mb-4" />
            <p className="text-lg font-medium">All clear!</p>
            <p className="text-muted-foreground">No payments waiting for your review. New submissions from tenants will appear here for you to approve or reject.</p>
          </CardContent>
        </Card>
      )}

      {/* All Payments Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">All Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-primary/5">
                  <th className="text-left px-4 py-3 font-medium">Tenant</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Transaction ID</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {(allPayments ?? []).map(p => (
                  <tr key={p.id} className="border-b cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                    <td className="px-4 py-3 font-medium">{(p.tenant as any)?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono">{formatRWF(p.amount)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.transaction_id ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.submitted_at)}</td>
                  </tr>
                ))}
                {(!allPayments || allPayments.length === 0) && (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => { if (!open) { setRejectModal({ open: false, paymentId: null }); setRejectReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Why was this payment rejected?</Label>
            <Textarea
              placeholder="e.g. Transaction ID could not be verified in our MoMo records."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            {rejectReason.length > 0 && rejectReason.length < 10 && (
              <p className="text-xs text-destructive">Please provide at least 10 characters.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectModal({ open: false, paymentId: null }); setRejectReason(''); }}>Cancel</Button>
            <Button variant="destructive" disabled={rejectReason.length < 10 || !!processingId} onClick={handleReject}>
              {processingId ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
