import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { mockInvoices, formatRWF, formatDate } from '@/data/mockData';

export default function TenantInvoices() {
  const navigate = useNavigate();
  const myInvoices = mockInvoices.filter(i => i.tenantId === 't1');

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Invoices</h1><p className="text-muted-foreground">{myInvoices.length} invoices</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Invoice #</TableHead><TableHead>Period</TableHead><TableHead>Amount</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myInvoices.map(inv => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/tenant/invoices/${inv.id}`)}>
                  <TableCell className="font-medium text-primary">{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.period}</TableCell>
                  <TableCell>{formatRWF(inv.amount)}</TableCell>
                  <TableCell className="font-medium">{formatRWF(inv.balance)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
