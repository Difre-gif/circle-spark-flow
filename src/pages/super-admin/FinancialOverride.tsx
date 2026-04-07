import { useState } from 'react';
import { DollarSign, CheckCircle, XCircle, Trash2, Pencil, AlertTriangle, Loader2, Search, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

// ─── Hooks ───
function useGlobalPendingPayments() {
  return useQuery({
    queryKey: ['sa-pending-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, tenant:users!payments_tenant_user_id_fkey(full_name, email), invoice:invoices!payments_invoice_id_fkey(invoice_number, amount_due, org_id, unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name))), org:invoices!payments_invoice_id_fkey(organisations!invoices_org_id_fkey(name))')
        .eq('status', 'PENDING')
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useGlobalOverdueInvoices() {
  return useQuery({
    queryKey: ['sa-overdue-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, tenant:users!invoices_tenant_user_id_fkey(full_name, email), unit:units!invoices_unit_id_fkey(unit_number, property:properties!units_property_id_fkey(name)), org:organisations!invoices_org_id_fkey(name)')
        .in('status', ['OVERDUE', 'PARTIAL'])
        .order('due_date', { ascending: true })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

function useForceApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase.rpc('superadmin_force_approve_payment', { p_payment_id: paymentId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-pending-payments'] }); toast.success('Payment force-approved'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useForceReject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      const { error } = await supabase.rpc('superadmin_force_reject_payment', { p_payment_id: paymentId, p_reason: reason });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-pending-payments'] }); toast.success('Payment force-rejected'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useWipeDebt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase.rpc('superadmin_wipe_debt', { p_invoice_id: invoiceId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-overdue-invoices'] }); toast.success('Debt wiped — invoice marked PAID'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useAdjustBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ invoiceId, amountDue, amountPaid }: { invoiceId: string; amountDue: number; amountPaid: number }) => {
      const { error } = await supabase.rpc('superadmin_adjust_balance', { p_invoice_id: invoiceId, p_amount_due: amountDue, p_amount_paid: amountPaid });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-overdue-invoices'] }); toast.success('Balance adjusted'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useBulkMarkOverdue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('superadmin_bulk_mark_overdue');
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => { qc.invalidateQueries({ queryKey: ['sa-overdue-invoices'] }); toast.success(`${count} invoices marked OVERDUE`); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export default function FinancialOverride() {
  const { data: payments, isLoading: paymentsLoading } = useGlobalPendingPayments();
  const { data: overdueInvoices, isLoading: invoicesLoading } = useGlobalOverdueInvoices();
  const forceApprove = useForceApprove();
  const forceReject = useForceReject();
  const wipeDebt = useWipeDebt();
  const adjustBalance = useAdjustBalance();
  const bulkMarkOverdue = useBulkMarkOverdue();

  const [rejectTarget, setRejectTarget] = useState<{ id: string; tenant: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [wipeTarget, setWipeTarget] = useState<{ id: string; number: string; balance: number } | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<any | null>(null);
  const [adjustForm, setAdjustForm] = useState({ amountDue: '', amountPaid: '' });
  const [search, setSearch] = useState('');

  const filteredPayments = (payments ?? []).filter(p => {
    const q = search.toLowerCase();
    if (!q) return true;
    const tenant = (p.tenant as any)?.full_name?.toLowerCase() ?? '';
    const inv = (p.invoice as any)?.invoice_number?.toLowerCase() ?? '';
    const txid = (p.transaction_id ?? '').toLowerCase();
    return tenant.includes(q) || inv.includes(q) || txid.includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Financial Override</h1>
        </div>
        <p className="text-slate-400 text-sm">MoMo Mastery — full ledger control across all organisations.</p>
      </div>

      <Tabs defaultValue="queue">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="queue" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">
            Global Payment Queue {(payments?.length ?? 0) > 0 && <Badge className="ml-2 bg-red-500 text-white text-[10px] px-1.5">{payments?.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="debt" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">
            Debt Control
          </TabsTrigger>
        </TabsList>

        {/* ─── Payment Queue ─── */}
        <TabsContent value="queue" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search tenant, invoice, TxID…" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500" />
            </div>
            <p className="text-slate-400 text-xs">{filteredPayments.length} pending across all orgs</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Tenant</th>
                      <th className="text-left px-4 py-3">Invoice</th>
                      <th className="text-left px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">TxID</th>
                      <th className="text-left px-4 py-3">Submitted</th>
                      <th className="text-center px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsLoading ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-20 bg-slate-700" /></td>)}
                      </tr>
                    )) : filteredPayments.map(p => {
                      const inv = p.invoice as any;
                      const tenant = p.tenant as any;
                      return (
                        <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="px-6 py-4">
                            <p className="text-white font-medium text-sm">{tenant?.full_name ?? '—'}</p>
                            <p className="text-slate-400 text-xs">{tenant?.email ?? ''}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-300 text-xs font-mono">{inv?.invoice_number ?? '—'}</td>
                          <td className="px-4 py-4 font-bold text-white">{formatRWF(p.amount)}</td>
                          <td className="px-4 py-4">
                            <code className="text-[10px] bg-slate-900 text-emerald-300 px-2 py-0.5 rounded">{p.transaction_id ?? '—'}</code>
                          </td>
                          <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDate(p.submitted_at)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" className="h-7 text-xs bg-emerald-600/80 hover:bg-emerald-600 text-white"
                                disabled={forceApprove.isPending}
                                onClick={() => forceApprove.mutate(p.id)}>
                                {forceApprove.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                Approve
                              </Button>
                              <Button size="sm" variant="outline"
                                className="h-7 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10"
                                onClick={() => { setRejectTarget({ id: p.id, tenant: tenant?.full_name ?? tenant?.email ?? 'tenant' }); setRejectReason(''); }}>
                                <XCircle className="h-3 w-3 mr-1" /> Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!paymentsLoading && filteredPayments.length === 0 && (
                      <tr><td colSpan={6} className="py-16 text-center">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500/40" />
                        <p className="text-slate-500 text-sm">No pending payments across the platform</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Debt Control ─── */}
        <TabsContent value="debt" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{overdueInvoices?.length ?? 0} overdue / partial invoices</p>
              <p className="text-slate-400 text-xs">Cross-org — all organisations</p>
            </div>
            <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs"
              onClick={() => bulkMarkOverdue.mutate()} disabled={bulkMarkOverdue.isPending}>
              {bulkMarkOverdue.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
              Bulk Mark Overdue
            </Button>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Invoice</th>
                      <th className="text-left px-4 py-3">Tenant</th>
                      <th className="text-left px-4 py-3">Due</th>
                      <th className="text-left px-4 py-3">Paid</th>
                      <th className="text-left px-4 py-3">Balance</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-center px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesLoading ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        {[1,2,3,4,5,6,7].map(j => <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-16 bg-slate-700" /></td>)}
                      </tr>
                    )) : (overdueInvoices ?? []).map(inv => {
                      const balance = Number(inv.amount_due) - Number(inv.amount_paid);
                      const tenant = inv.tenant as any;
                      return (
                        <tr key={inv.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="px-6 py-4 font-mono text-xs text-emerald-300">{inv.invoice_number}</td>
                          <td className="px-4 py-4 text-white text-sm">{tenant?.full_name ?? '—'}</td>
                          <td className="px-4 py-4 text-slate-300 text-xs font-tabular-nums">{formatRWF(inv.amount_due)}</td>
                          <td className="px-4 py-4 text-emerald-400 text-xs font-tabular-nums">{formatRWF(inv.amount_paid)}</td>
                          <td className="px-4 py-4 font-bold text-red-400 text-xs font-tabular-nums">{formatRWF(balance)}</td>
                          <td className="px-4 py-4">
                            <Badge className={`text-[10px] ${inv.status === 'OVERDUE' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="outline"
                                className="h-7 text-[10px] border-slate-600 text-slate-300 hover:bg-slate-700"
                                onClick={() => { setAdjustTarget(inv); setAdjustForm({ amountDue: String(inv.amount_due), amountPaid: String(inv.amount_paid) }); }}>
                                <Pencil className="h-3 w-3 mr-1" /> Adjust
                              </Button>
                              <Button size="sm" variant="outline"
                                className="h-7 text-[10px] border-red-500/40 text-red-400 hover:bg-red-500/10"
                                onClick={() => setWipeTarget({ id: inv.id, number: inv.invoice_number, balance })}>
                                <Trash2 className="h-3 w-3 mr-1" /> Wipe
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!invoicesLoading && (overdueInvoices ?? []).length === 0 && (
                      <tr><td colSpan={7} className="py-12 text-center text-slate-500 text-sm">No overdue or partial invoices platform-wide</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── Reject Dialog ─── */}
      <Dialog open={!!rejectTarget} onOpenChange={open => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" /> Force-Reject Payment
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Rejecting payment from <strong className="text-white">{rejectTarget?.tenant}</strong>. A mandatory rejection reason is required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Rejection Reason <span className="text-red-500">*</span></Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Transaction ID does not match MoMo records. Please resubmit with correct ID."
              className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 resize-none h-20" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={!rejectReason.trim() || forceReject.isPending}
              onClick={() => { if (rejectTarget) forceReject.mutate({ paymentId: rejectTarget.id, reason: rejectReason }, { onSuccess: () => setRejectTarget(null) }); }}>
              {forceReject.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Force Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Wipe Debt Dialog ─── */}
      <Dialog open={!!wipeTarget} onOpenChange={open => { if (!open) setWipeTarget(null); }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" /> Wipe Debt — {wipeTarget?.number}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This will set <code className="text-white">amount_paid = amount_due</code> and mark this invoice as <strong className="text-white">PAID</strong>.
              The outstanding balance of <strong className="text-emerald-400">{formatRWF(wipeTarget?.balance ?? 0)}</strong> will be zeroed. No payment record is created.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300">
            ⚠️ This action is irreversible and logged under your Super Admin ID.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setWipeTarget(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" disabled={wipeDebt.isPending}
              onClick={() => { if (wipeTarget) wipeDebt.mutate(wipeTarget.id, { onSuccess: () => setWipeTarget(null) }); }}>
              {wipeDebt.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Wipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Adjust Balance Dialog ─── */}
      <Dialog open={!!adjustTarget} onOpenChange={open => { if (!open) setAdjustTarget(null); }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" /> Adjust Balance — {adjustTarget?.invoice_number}
            </DialogTitle>
            <DialogDescription className="text-slate-400">Edit amount_due and amount_paid directly. Status is recalculated automatically.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Amount Due (RWF)</Label>
              <Input type="number" value={adjustForm.amountDue} onChange={e => setAdjustForm(f => ({ ...f, amountDue: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-sm">Amount Paid (RWF)</Label>
              <Input type="number" value={adjustForm.amountPaid} onChange={e => setAdjustForm(f => ({ ...f, amountPaid: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setAdjustTarget(null)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" disabled={adjustBalance.isPending}
              onClick={() => { if (adjustTarget) adjustBalance.mutate({ invoiceId: adjustTarget.id, amountDue: Number(adjustForm.amountDue), amountPaid: Number(adjustForm.amountPaid) }, { onSuccess: () => setAdjustTarget(null) }); }}>
              {adjustBalance.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
