import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { mockTenancies, formatRWF, formatDate } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Tenancies() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Tenancies</h1><p className="text-muted-foreground">{mockTenancies.length} lease agreements</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Tenancy</Button>
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
              {mockTenancies.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.tenantName}</TableCell>
                  <TableCell>{t.unitNumber}</TableCell>
                  <TableCell>{t.propertyName}</TableCell>
                  <TableCell className="text-sm">{formatDate(t.startDate)}</TableCell>
                  <TableCell>{formatRWF(t.agreedRent)}</TableCell>
                  <TableCell>{formatRWF(t.deposit)}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Tenancy Agreement</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Tenant</Label><Input placeholder="Select tenant" /></div>
            <div className="space-y-2"><Label>Unit</Label><Input placeholder="Select unit" /></div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Monthly Rent (RWF)</Label><Input type="number" placeholder="300000" /></div>
              <div className="space-y-2"><Label>Deposit (RWF)</Label><Input type="number" placeholder="300000" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setDialogOpen(false)}>Create Tenancy</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
