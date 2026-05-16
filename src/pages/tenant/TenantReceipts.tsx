import { useTranslation } from 'react-i18next';
import { Loader2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganisation, useReceipts, formatDate } from '@/hooks/useSupabaseData';
import { downloadReceiptPdf } from '@/lib/receiptPdf';

export default function TenantReceipts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: receipts, isLoading } = useReceipts(user?.id);
  const { data: organisation } = useOrganisation();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">{t('legacy.myReceiptsTitle')}</h1><p className="text-muted-foreground">{receipts?.length ?? 0} receipts</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>{t('legacy.receiptNumber')}</TableHead><TableHead>{t('legacy.invoice')}</TableHead><TableHead>{t('legacy.date')}</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {(receipts ?? []).map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-extrabold text-bizrent-navy dark:text-white font-mono">BR-2026-{r.receipt_number.split("-").pop()}</TableCell>
                  <TableCell>{(r.invoice as any)?.invoice_number ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(r.generated_at)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => downloadReceiptPdf(r as any, organisation?.name)}>
                      <Download className="mr-1 h-3 w-3" /> {t('legacy.pdf')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!receipts || receipts.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{t('legacy.noReceiptsYet')}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}