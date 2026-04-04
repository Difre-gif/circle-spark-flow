import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useTenancies, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function Tenancies() {
  const { data: tenancies, isLoading } = useTenancies();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tenancies</h1>
        <p className="text-muted-foreground">{tenancies?.length ?? 0} lease agreements</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Tenant</TableHead><TableHead>Unit</TableHead><TableHead>Property</TableHead><TableHead>Start Date</TableHead><TableHead>Rent</TableHead><TableHead>Deposit</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(tenancies ?? []).map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{(t.tenant as any)?.full_name ?? '—'}</TableCell>
                  <TableCell>{(t.unit as any)?.unit_number ?? '—'}</TableCell>
                  <TableCell>{(t.unit as any)?.property?.name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{formatDate(t.start_date)}</TableCell>
                  <TableCell>{formatRWF(t.agreed_rent)}</TableCell>
                  <TableCell>{formatRWF(t.deposit_amount)}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                </TableRow>
              ))}
              {(!tenancies || tenancies.length === 0) && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No tenancies found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
