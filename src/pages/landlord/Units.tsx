import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { mockUnits, formatRWF } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Units() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const filtered = mockUnits.filter(u => u.unitNumber.toLowerCase().includes(search.toLowerCase()) || u.propertyName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Units</h1><p className="text-muted-foreground">{mockUnits.length} total units</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Unit</Button>
      </div>
      <Input placeholder="Search units..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Unit #</TableHead><TableHead>Property</TableHead><TableHead>Type</TableHead><TableHead>Rent</TableHead><TableHead>Status</TableHead><TableHead>Tenant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.unitNumber}</TableCell>
                  <TableCell>{u.propertyName}</TableCell>
                  <TableCell>{u.type}</TableCell>
                  <TableCell>{formatRWF(u.monthlyRent)}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{u.tenantName || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Property</Label><Select><SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger><SelectContent><SelectItem value="p1">Sunrise Apartments</SelectItem><SelectItem value="p2">Green Valley Villas</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Unit Number</Label><Input placeholder="A-301" /></div>
            <div className="space-y-2"><Label>Type</Label><Input placeholder="2 Bedroom" /></div>
            <div className="space-y-2"><Label>Monthly Rent (RWF)</Label><Input type="number" placeholder="300000" /></div>
          </div>
          <DialogFooter><Button onClick={() => setDialogOpen(false)}>Save Unit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
