import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockReceipts, formatRWF, formatDate } from '@/data/mockData';
import { Download } from 'lucide-react';

export default function Receipts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Receipts</h1>
        <p className="text-muted-foreground">{mockReceipts.length} receipts generated</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Receipt #</TableHead><TableHead>Invoice</TableHead><TableHead>Tenant</TableHead><TableHead>Unit</TableHead><TableHead>Property</TableHead><TableHead>Amount</TableHead><TableHead>Paid Date</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReceipts.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-primary">{r.receiptNumber}</TableCell>
                  <TableCell>{r.invoiceNumber}</TableCell>
                  <TableCell>{r.tenantName}</TableCell>
                  <TableCell>{r.unitNumber}</TableCell>
                  <TableCell>{r.propertyName}</TableCell>
                  <TableCell className="font-semibold">{formatRWF(r.amount)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(r.paidDate)}</TableCell>
                  <TableCell><Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" /> PDF</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
