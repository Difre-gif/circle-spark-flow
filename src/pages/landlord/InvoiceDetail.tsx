import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { useInvoice, usePayments, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function InvoiceDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: allPayments } = usePayments();
  const payments = (allPayments ?? []).filter(p => p.invoice_id === id);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!invoice) return <div className="text-center py-12 text-muted-foreground">{t('legacy.invoiceNotFound')}</div>;

  const balance = Number(invoice.balance ?? (invoice.amount_due - invoice.amount_paid));
  const orgName = (invoice.unit as any)?.property?.organisation?.name ?? 'BizRent';
  const propertyName = (invoice.unit as any)?.property?.name ?? '';
  const unitNumber = (invoice.unit as any)?.unit_number ?? '';
  const tenantName = (invoice.tenant as any)?.full_name ?? '—';

  return (
    <>
      {/* ── Print-only styles injected inline ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-printable, #invoice-printable * { visibility: visible; }
          #invoice-printable { position: fixed; inset: 0; padding: 40px; background: white; }
          .no-print { display: none !important; }
          .print-header { display: flex !important; }
        }
        .print-header { display: none; }
      `}</style>

    <div className="space-y-6" id="invoice-printable">
      <div className="flex items-center gap-4 no-print">
        <Button variant="ghost" size="icon" onClick={() => navigate('/landlord/invoices')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground">{propertyName}</p>
        </div>
        <StatusBadge status={invoice.status} />
        <Button variant="outline" className="gap-2 rounded-xl font-semibold" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> {t('legacy.exportPdf')}
        </Button>
      </div>

      {/* Print header (visible only when printing) */}
      <div className="print-header items-start justify-between border-b pb-6 mb-2">
        <div>
          <p className="text-2xl font-black text-foreground">{t('legacy.bizrent')}</p>
          <p className="text-sm text-muted-foreground">{orgName}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-foreground">{invoice.invoice_number}</p>
          <p className="text-sm text-muted-foreground">Status: {invoice.status}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('legacy.invoiceDetails')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.tenant')}</span><span className="font-medium">{tenantName}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.unit')}</span><span>{unitNumber || '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.property')}</span><span>{propertyName || '—'}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.dueDate')}</span><span>{formatDate(invoice.due_date)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.amount')}</span><span className="font-mono text-lg text-bizrent-navy dark:text-white font-bold">{formatRWF(invoice.amount_due)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.paid')}</span><span className="font-mono text-bizrent-emerald font-bold">{formatRWF(invoice.amount_paid)}</span></div>
            <Separator />
            <div className="flex justify-between"><span className="text-muted-foreground">{t('legacy.balance')}</span><span className="font-mono text-lg text-bizrent-navy dark:text-white font-bold">{formatRWF(balance)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('legacy.paymentHistoryTitle')}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow className="bg-primary/5"><TableHead>{t('legacy.transactionId')}</TableHead><TableHead>{t('legacy.amount')}</TableHead><TableHead>{t('legacy.status')}</TableHead><TableHead>{t('legacy.date')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('legacy.noPaymentsRecordedYet')}</TableCell></TableRow>
                ) : payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.transaction_id ?? '—'}</TableCell>
                    <TableCell className="font-mono">{formatRWF(p.amount)}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-sm">{formatDate(p.submitted_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}