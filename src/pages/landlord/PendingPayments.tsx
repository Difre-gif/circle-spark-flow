import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, CreditCard, Copy, Check, Eye, HelpCircle, X, ChevronRight, Search, Filter } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { usePayments, useApprovePayment, useRejectPayment, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/permissions';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PendingPayments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orgRole } = useAuth();
  const canApprove = can(orgRole ?? '', 'payment:approve');
  const { data: pendingPayments, isLoading: pendingLoading } = usePayments({ status: 'PENDING' });
  const { data: allPayments, isLoading: allLoading } = usePayments();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; paymentId: string | null }>({ open: false, paymentId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showMomoExplainer, setShowMomoExplainer] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('ALL');

  const approvedCount = (allPayments ?? []).filter(p => p.status === 'APPROVED' || p.status === 'AUTO_APPROVED').length;
  const rejectedCount = (allPayments ?? []).filter(p => p.status === 'REJECTED').length;

  const isLoading = pendingLoading || allLoading;

  const filteredHistory = (allPayments ?? []).filter(p => {
    const matchesSearch = ((p.tenant as any)?.full_name ?? '').toLowerCase().includes(historySearch.toLowerCase()) || 
                          (p.transaction_id ?? '').toLowerCase().includes(historySearch.toLowerCase());
    const matchesStatus = historyStatus === 'ALL' || p.status === historyStatus;
    return matchesSearch && matchesStatus;
  });

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
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy dark:text-white transition-colors">{t('legacy.collections')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">{t('legacy.paymentsQueue')}</span>
          </p>
          <h1 className="page-title">{t('legacy.paymentsQueue')}</h1>
          <p className="page-description">{t('legacy.reviewAndProcessTenantPaymentSubmissions')}</p>
        </div>
      </div>

      {showMomoExplainer && (
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl p-4 flex gap-4 items-start relative animate-in fade-in slide-in-from-top-4">
          <div className="bg-[#F59E0B] h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1">
            <HelpCircle className="h-5 w-5 text-bizrent-navy dark:text-white" />
          </div>
          <div className="flex-1 pr-8">
            <h3 className="font-bold text-bizrent-navy dark:text-white text-sm mb-1">{t('legacy.howMtnMobileMoneyMomoPaymentsWork')}</h3>
            <p className="text-sm text-muted-foreground">
              BizRent uses MoMo to process tenant payments. Tenants send funds to your Merchant Code, then enter the Transaction ID here. 
              Always verify the amount and Transaction ID in your MoMo app before approving a payment below.
            </p>
            <Button variant="link" className="p-0 h-auto font-bold text-bizrent-navy dark:text-white text-xs mt-2" onClick={() => console.log('Help Article')}>
              {t('legacy.readFullGuide')} <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-black/5"
            onClick={() => setShowMomoExplainer(false)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard title="Pending Review" value={String((pendingPayments ?? []).length)} icon={CreditCard} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card" />
        <StatCard title="Approved" value={String(approvedCount)} icon={CheckCircle} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card" />
        <StatCard title="Rejected" value={String(rejectedCount)} icon={XCircle} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card" />
      </div>

      {(pendingPayments ?? []).length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-bizrent-navy dark:text-white">{t('legacy.awaitingYourReview')}</h2>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {(pendingPayments ?? []).map(p => (
              <Card key={p.id} className="overflow-hidden rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg text-bizrent-navy dark:text-white">{(p.tenant as any)?.full_name ?? '—'}</p>
                      <p className="text-sm font-medium text-muted-foreground mt-0.5">
                        {(p.invoice as any)?.invoice_number ?? '—'} · {p.payment_method?.replace('_', ' ')}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="text-3xl font-extrabold font-mono text-bizrent-navy dark:text-white tracking-tight">{formatRWF(p.amount)}</div>

                  {p.transaction_id && (
                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">TX:</span>
                      <code className="text-sm font-mono font-bold text-bizrent-navy dark:text-white">{p.transaction_id}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => handleCopy(p.transaction_id!)}>
                        {copiedId === p.transaction_id ? <Check className="h-3 w-3 text-bizrent-emerald" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}

                  <p className="text-xs font-medium text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(p.submitted_at), { addSuffix: true })}
                  </p>

                  <div className="flex gap-3 pt-2">
                    {canApprove && <Button
                      size="sm"
                      className="flex-1 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-[6px] min-h-[44px]"
                      style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, fontSize: '14px' }}
                      disabled={processingId === p.id}
                      onClick={() => handleApprove(p.id)}
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" /> {t('legacy.approve')}
                    </Button>}
                    {canApprove && <Button
                      size="sm"
                      className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-sm rounded-[6px] min-h-[44px]"
                      style={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, fontSize: '14px' }}
                      disabled={processingId === p.id}
                      onClick={() => setRejectModal({ open: true, paymentId: p.id })}
                    >
                      <XCircle className="mr-1.5 h-4 w-4" /> {t('legacy.reject')}
                    </Button>}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF] rounded-[6px] min-h-[44px] min-w-[44px] px-3"
                      onClick={() => navigate(`/landlord/payments/${p.id}`)}
                    >
                      <Eye className="h-4 w-4" />
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
            <p className="text-xl font-bold text-bizrent-navy dark:text-white">{t('legacy.allClear')}</p>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto font-medium">{t('legacy.noPaymentsWaitingForYourReviewNewSubmissionsFromTenantsWillAppearHereF')}</p>
          </CardContent>
        </Card>
      )}

      {/* All Payments Table */}
      <Card className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-bold text-bizrent-navy dark:text-white">{t('legacy.allPaymentsHistory')}</CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tenant or TX ID..." 
                value={historySearch} 
                onChange={e => setHistorySearch(e.target.value)} 
                className="pl-9 h-10 rounded-full bg-muted/30 border-transparent focus-visible:ring-bizrent-blue/20/20 text-sm font-medium w-full" 
              />
            </div>
            <Select value={historyStatus} onValueChange={setHistoryStatus}>
              <SelectTrigger className="w-[140px] h-10 rounded-full bg-muted/30 border-transparent focus:ring-bizrent-blue/20 font-medium">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('legacy.allStatus')}</SelectItem>
                <SelectItem value="APPROVED">{t('legacy.approved')}</SelectItem>
                <SelectItem value="PENDING">{t('legacy.pending')}</SelectItem>
                <SelectItem value="REJECTED">{t('legacy.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-[#1E3A8A] text-white font-semibold">
                  <th className="text-left px-6 py-4 font-semibold text-sm">{t('legacy.tenant')}</th>
                  <th className="px-6 py-4 font-semibold text-sm text-right">{t('legacy.amount')}</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">{t('legacy.transactionId')}</th>
                  <th className="px-6 py-4 font-semibold text-sm text-center">{t('legacy.status')}</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">{t('legacy.date')}</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-[#F8FAFC] [&_tr:nth-child(odd)]:bg-white">
                {filteredHistory.map(p => (
                  <tr key={p.id} className="border-b border-[#E2E8F0] cursor-pointer hover:bg-[#EFF6FF] transition-colors" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                    <td className="px-6 py-4 font-semibold text-[#0F172A]">{(p.tenant as any)?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 font-semibold text-[#0F172A] text-right font-mono">{formatRWF(p.amount)}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono bg-[#F8FAFC] px-2 py-1 rounded border border-[#E2E8F0] text-[#1E3A8A]">{p.transaction_id ?? '—'}</code>
                    </td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground font-medium text-xs">{formatDate(p.submitted_at)}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground font-medium">{t('legacy.noPaymentsMatchYourSearch')}</td></tr>
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
            <DialogTitle className="text-xl font-bold text-bizrent-navy dark:text-white">{t('legacy.rejectPayment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label className="text-sm font-semibold">{t('legacy.whyWasThisPaymentRejected')}</Label>
            <Textarea
              placeholder="e.g. Transaction ID could not be verified in our MoMo records."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none focus-visible:ring-bizrent-red/20"
            />
            {rejectReason.length > 0 && rejectReason.length < 10 && (
              <p className="text-xs font-semibold text-bizrent-red">{t('legacy.pleaseProvideAtLeast10Characters')}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => { setRejectModal({ open: false, paymentId: null }); setRejectReason(''); }}>{t('legacy.cancel')}</Button>
            <Button variant="destructive" className="rounded-xl font-semibold bg-bizrent-red hover:bg-bizrent-red/90" disabled={rejectReason.length < 10 || !!processingId} onClick={handleReject}>
              {processingId ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}