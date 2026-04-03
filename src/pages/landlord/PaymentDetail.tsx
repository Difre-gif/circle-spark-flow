import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { mockPayments, formatRWF, formatDate } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const payment = mockPayments.find(p => p.id === id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!payment) return <div className="text-center py-12 text-muted-foreground">Payment not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/landlord/payments')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Payment Review</h1>
          <p className="text-muted-foreground">{payment.transactionId}</p>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Tenant</span><span className="font-medium">{payment.tenantName}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{payment.unitNumber}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span>{payment.propertyName}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span><span className="text-primary font-medium">{payment.invoiceNumber}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="text-xl font-bold">{formatRWF(payment.amount)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Provider</span><span>{payment.provider.replace('_', ' ')}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-mono">{payment.transactionId}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span>{formatDate(payment.submittedAt)}</span></div>
            {payment.reviewedAt && <>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Reviewed</span><span>{formatDate(payment.reviewedAt)}</span></div>
            </>}
            {payment.reviewedBy && <>
              <Separator />
              <div className="flex justify-between"><span className="text-muted-foreground">Reviewed By</span><span>{payment.reviewedBy}</span></div>
            </>}
            {payment.rejectionReason && <>
              <Separator />
              <div>
                <p className="text-muted-foreground text-sm mb-1">Rejection Reason</p>
                <p className="text-sm bg-destructive/10 text-destructive rounded-md p-3">{payment.rejectionReason}</p>
              </div>
            </>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Proof</CardTitle></CardHeader>
          <CardContent>
            <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">MoMo Screenshot</p>
                <p className="text-xs mt-1">Transaction confirmation image</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {payment.status === 'PENDING' && (
        <div className="flex gap-3 justify-end">
          <Button variant="outline" className="text-bizrent-red border-bizrent-red hover:bg-bizrent-red/10" onClick={() => setRejectOpen(true)}>
            <XCircle className="mr-2 h-4 w-4" /> Reject Payment
          </Button>
          <Button className="bg-bizrent-emerald hover:bg-bizrent-emerald/90">
            <CheckCircle className="mr-2 h-4 w-4" /> Approve Payment
          </Button>
        </div>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Please provide a reason for rejecting this payment. The tenant will be notified.</p>
            <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="e.g. Transaction ID does not match MoMo records" value={reason} onChange={e => setReason(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setRejectOpen(false)}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
