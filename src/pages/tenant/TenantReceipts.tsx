import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { mockReceipts, formatRWF, formatDate } from '@/data/mockData';

export default function TenantReceipts() {
  const myReceipts = mockReceipts.filter(r => r.tenantName === 'Alice Uwimana');

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Receipts</h1><p className="text-muted-foreground">{myReceipts.length} receipts</p></div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="bg-primary/5"><TableHead>Receipt #</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {myReceipts.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.receiptNumber}</TableCell>
                  <TableCell>{r.invoiceNumber}</TableCell>
                  <TableCell className="font-semibold">{formatRWF(r.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(r.paidDate)}</TableCell>
                  <TableCell><Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" /> PDF</Button></TableCell>
                </TableRow>
              ))}
              {myReceipts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No receipts yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
