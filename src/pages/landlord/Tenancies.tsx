import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useTenancies, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function Tenancies() {
  const { t } = useTranslation();
  const { data: tenancies, isLoading } = useTenancies();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('legacy.tenancies')}</h1>
        <p className="text-muted-foreground">{tenancies?.length ?? 0} lease agreements</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>{t('legacy.tenant')}</TableHead><TableHead>{t('legacy.unit')}</TableHead><TableHead>{t('legacy.property')}</TableHead><TableHead>{t('legacy.startDate')}</TableHead><TableHead>{t('legacy.rent')}</TableHead><TableHead>{t('legacy.deposit')}</TableHead><TableHead>{t('legacy.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(tenancies ?? []).map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{(t.tenant as any)?.full_name ?? '—'}</TableCell>
                  <TableCell>{(t.unit as any)?.unit_number ?? '—'}</TableCell>
                  <TableCell>{(t.unit as any)?.property?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{formatDate(t.start_date)}</TableCell>
                  <TableCell className="font-mono">{formatRWF(t.agreed_rent)}</TableCell>
                  <TableCell className="font-mono">{formatRWF(t.deposit_amount)}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                </TableRow>
              ))}
              {(!tenancies || tenancies.length === 0) && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('legacy.noTenanciesFound')}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}