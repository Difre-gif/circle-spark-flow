import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePayments, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function TenantPaymentHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: payments, isLoading } = usePayments({ tenantUserId: user?.id });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{t('legacy.paymentHistoryTitle')}</h1><p className="text-muted-foreground">{payments?.length ?? 0} payments</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>{t('legacy.transactionId')}</TableHead><TableHead>{t('legacy.invoice')}</TableHead><TableHead>{t('legacy.amount')}</TableHead><TableHead>{t('legacy.method')}</TableHead><TableHead>{t('legacy.status')}</TableHead><TableHead>{t('legacy.date')}</TableHead></TableRow></TableHeader>
            <TableBody>
              {(payments ?? []).map(p => (
                <TableRow key={p.id}>
                  <TableCell data-label={t('legacy.transactionId')} className="font-mono text-sm">{p.transaction_id ?? '—'}</TableCell>
                  <TableCell data-label={t('legacy.invoice')}>{(p.invoice as any)?.invoice_number ?? '—'}</TableCell>
                  <TableCell data-label={t('legacy.amount')} className="font-mono font-bold text-bizrent-navy dark:text-white">{formatRWF(p.amount)}</TableCell>
                  <TableCell data-label={t('legacy.method')}>{p.payment_method?.replace('_', ' ')}</TableCell>
                  <TableCell data-label={t('legacy.status')}><StatusBadge status={p.status} /></TableCell>
                  <TableCell data-label={t('legacy.date')} className="text-sm text-muted-foreground">{formatDate(p.submitted_at)}</TableCell>
                </TableRow>
              ))}
              {(!payments || payments.length === 0) && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('legacy.noPaymentsYet')}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
