import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { CheckCircle, XCircle, Eye, CreditCard, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { usePayments, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function PendingPayments() {
  const navigate = useNavigate();
  const { data: allPayments, isLoading } = usePayments();
  const pendingPayments = (allPayments ?? []).filter(p => p.status === 'PENDING');
  const approvedCount = (allPayments ?? []).filter(p => p.status === 'APPROVED' || p.status === 'AUTO_APPROVED').length;
  const rejectedCount = (allPayments ?? []).filter(p => p.status === 'REJECTED').length;

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments Queue</h1>
        <p className="text-muted-foreground">Review and process tenant payment submissions</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard title="Pending Review" value={String(pendingPayments.length)} icon={CreditCard} className="border-l-4 border-l-bizrent-amber" />
        <StatCard title="Approved" value={String(approvedCount)} icon={CheckCircle} className="border-l-4 border-l-bizrent-emerald" />
        <StatCard title="Rejected" value={String(rejectedCount)} icon={XCircle} className="border-l-4 border-l-bizrent-red" />
      </div>

      {pendingPayments.length > 0 ? (
        <Card>
          <CardHeader><CardTitle className="text-lg">Awaiting Your Review</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-bizrent-amber/10">
                  <TableHead>Tenant</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Transaction ID</TableHead><TableHead>Method</TableHead><TableHead>Submitted</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{(p.tenant as any)?.full_name ?? '—'}</TableCell>
                    <TableCell className="text-primary">{(p.invoice as any)?.invoice_number ?? '—'}</TableCell>
                    <TableCell className="font-semibold">{formatRWF(p.amount)}</TableCell>
                    <TableCell className="font-mono text-sm">{p.transaction_id ?? '—'}</TableCell>
                    <TableCell>{p.payment_method?.replace('_', ' ')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(p.submitted_at)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                        <Eye className="mr-1 h-3 w-3" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-bizrent-emerald mb-4" />
            <p className="text-lg font-medium">All clear!</p>
            <p className="text-muted-foreground">No payments waiting for your review.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">All Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Tenant</TableHead><TableHead>Amount</TableHead><TableHead>Transaction ID</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(allPayments ?? []).map(p => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                  <TableCell className="font-medium">{(p.tenant as any)?.full_name ?? '—'}</TableCell>
                  <TableCell>{formatRWF(p.amount)}</TableCell>
                  <TableCell className="font-mono text-sm">{p.transaction_id ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.submitted_at)}</TableCell>
                </TableRow>
              ))}
              {(!allPayments || allPayments.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
