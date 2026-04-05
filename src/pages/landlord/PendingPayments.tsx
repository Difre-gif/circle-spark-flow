import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, CreditCard, Copy, Check, Eye } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl mt-8" />
      </div>
    );
  }

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest">Collections / Payments</p>
          <h1 className="page-title">Payments Queue</h1>
          <p className="page-description">Review and process tenant payment submissions</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard title="Pending Review" value={String((pendingPayments ?? []).length)} icon={CreditCard} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white" />
        <StatCard title="Approved" value={String(approvedCount)} icon={CheckCircle} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white" />
        <StatCard title="Rejected" value={String(rejectedCount)} icon={XCircle} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white" />
      </div>

      {(pendingPayments ?? []).length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-bizrent-navy">Awaiting Your Review</h2>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {(pendingPayments ?? []).map(p => (
              <Card key={p.id} className="overflow-hidden rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg text-bizrent-navy">{(p.tenant as any)?.full_name ?? '—'}</p>
                      <p className="text-sm font-medium text-muted-foreground mt-0.5">
                        {(p.invoice as any)?.invoice_number ?? '—'} · {p.payment_method?.replace('_', ' ')}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="text-3xl font-extrabold font-tabular-nums text-bizrent-navy">{formatRWF(p.amount)}</div>

                  {p.transaction_id && (
                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">TX:</span>
                      <code className="text-sm font-mono font-bold text-bizrent-navy">{p.transaction_id}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => handleCopy(p.transaction_id!)}>
                        {copiedId === p.transaction_id ? <Check className="h-3 w-3 text-bizrent-emerald" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}

                  <p className="text-xs font-medium text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(p.submitted_at), { addSuffix: true })}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[#ffcc00] hover:bg-[#e6b800] text-bizrent-navy font-bold shadow-sm rounded-xl"
                      disabled={processingId === p.id}
                      onClick={() => handleApprove(p.id)}
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border/80 text-bizrent-red hover:bg-red-50 hover:text-bizrent-red font-semibold rounded-xl"
                      disabled={processingId === p.id}
                      onClick={() => setRejectModal({ open: true, paymentId: p.id })}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-muted/80 rounded-xl px-3" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                      <Eye className="h-4 w-4 text-bizrent-navy" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border/60 bg-transparent shadow-none rounded-2xl">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-bizrent-navy">All clear!</p>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto font-medium">No payments waiting for your review. New submissions from tenants will appear here.</p>
          </CardContent>
        </Card>
      )}

      {/* All Payments Table */}
      <Card className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-border/40"><CardTitle className="text-base font-bold text-bizrent-navy">All Payments History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-muted-foreground font-semibold border-b border-border/40">
                  <th className="text-left px-6 py-4">Tenant</th>
                  <th className="text-left px-6 py-4 text-right">Amount</th>
                  <th className="text-left px-6 py-4">Transaction ID</th>
                  <th className="text-left px-6 py-4 text-center">Status</th>
                  <th className="text-left px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/10">
                {(allPayments ?? []).map(p => (
                  <tr key={p.id} className="border-b border-border/20 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                    <td className="px-6 py-4 font-bold text-bizrent-navy">{(p.tenant as any)?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 font-semibold text-bizrent-slate text-right font-tabular-nums">{formatRWF(p.amount)}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-bold bg-muted/50 px-2 py-1 rounded text-bizrent-navy">{p.transaction_id ?? '—'}</code>
                    </td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{formatDate(p.submitted_at)}</td>
                  </tr>
                ))}
                {(!allPayments || allPayments.length === 0) && (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground font-medium">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => { if (!open) { setRejectModal({ open: false, paymentId: null }); setRejectReason(''); } }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy">Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label className="text-sm font-semibold">Why was this payment rejected?</Label>
            <Textarea
              placeholder="e.g. Transaction ID could not be verified in our MoMo records."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none focus-visible:ring-bizrent-red/20"
            />
            {rejectReason.length > 0 && rejectReason.length < 10 && (
              <p className="text-xs font-semibold text-bizrent-red">Please provide at least 10 characters.</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => { setRejectModal({ open: false, paymentId: null }); setRejectReason(''); }}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl font-semibold bg-bizrent-red hover:bg-red-700" disabled={rejectReason.length < 10 || !!processingId} onClick={handleReject}>
              {processingId ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}