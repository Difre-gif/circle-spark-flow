import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function TenantInvoices() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: invoices, isLoading } = useInvoices({ tenantUserId: user?.id });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{t('legacy.myInvoicesTitle')}</h1><p className="text-muted-foreground">{invoices?.length ?? 0} invoices</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>{t('legacy.invoiceNumber')}</TableHead><TableHead>Type</TableHead><TableHead>{t('legacy.amount')}</TableHead><TableHead>{t('legacy.balance')}</TableHead><TableHead>{t('legacy.status')}</TableHead><TableHead>{t('legacy.due')}</TableHead></TableRow></TableHeader>
            <TableBody>
              {(invoices ?? []).map(inv => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/tenant/invoices/${inv.id}`)}>
                  <TableCell data-label={t('legacy.invoiceNumber')} className="font-medium text-primary">{inv.invoice_number}</TableCell>
                  <TableCell data-label="Type" className="font-semibold">{inv.invoice_type === 'DEPOSIT' ? 'Security Deposit' : 'Rent'}</TableCell>
                  <TableCell data-label={t('legacy.amount')} className="font-mono">{formatRWF(inv.amount_due)}</TableCell>
                  <TableCell data-label={t('legacy.balance')} className="font-mono font-bold text-bizrent-navy dark:text-white">{formatRWF(Number(inv.balance ?? (inv.amount_due - inv.amount_paid)))}</TableCell>
                  <TableCell data-label={t('legacy.status')}><StatusBadge status={inv.status} /></TableCell>
                  <TableCell data-label={t('legacy.due')} className="text-sm text-muted-foreground">{formatDate(inv.due_date)}</TableCell>
                </TableRow>
              ))}
              {(!invoices || invoices.length === 0) && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('legacy.noInvoicesYet')}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
