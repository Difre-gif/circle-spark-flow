import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function TenantInvoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: invoices, isLoading } = useInvoices({ tenantUserId: user?.id });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Invoices</h1><p className="text-muted-foreground">{invoices?.length ?? 0} invoices</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>Invoice #</TableHead><TableHead>Amount</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead></TableRow></TableHeader>
            <TableBody>
              {(invoices ?? []).map(inv => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/tenant/invoices/${inv.id}`)}>
                  <TableCell className="font-medium text-primary">{inv.invoice_number}</TableCell>
                  <TableCell>{formatRWF(inv.amount_due)}</TableCell>
                  <TableCell className="font-medium">{formatRWF(Number(inv.balance ?? (inv.amount_due - inv.amount_paid)))}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(inv.due_date)}</TableCell>
                </TableRow>
              ))}
              {(!invoices || invoices.length === 0) && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No invoices yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
