import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { mockPayments, formatRWF, formatDate } from '@/data/mockData';
import { CheckCircle, XCircle, Eye, CreditCard } from 'lucide-react';
import { StatCard } from '@/components/StatCard';

export default function PendingPayments() {
  const navigate = useNavigate();
  const pendingPayments = mockPayments.filter(p => p.status === 'PENDING');
  const approvedCount = mockPayments.filter(p => p.status === 'APPROVED').length;
  const rejectedCount = mockPayments.filter(p => p.status === 'REJECTED').length;

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
                  <TableHead>Tenant</TableHead><TableHead>Unit</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Transaction ID</TableHead><TableHead>Provider</TableHead><TableHead>Submitted</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.tenantName}</TableCell>
                    <TableCell>{p.unitNumber}</TableCell>
                    <TableCell className="text-primary">{p.invoiceNumber}</TableCell>
                    <TableCell className="font-semibold">{formatRWF(p.amount)}</TableCell>
                    <TableCell className="font-mono text-sm">{p.transactionId}</TableCell>
                    <TableCell>{p.provider.replace('_', ' ')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(p.submittedAt)}</TableCell>
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

      {/* All Payments Table */}
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
              {mockPayments.map(p => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/landlord/payments/${p.id}`)}>
                  <TableCell className="font-medium">{p.tenantName}</TableCell>
                  <TableCell>{formatRWF(p.amount)}</TableCell>
                  <TableCell className="font-mono text-sm">{p.transactionId}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(p.submittedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
