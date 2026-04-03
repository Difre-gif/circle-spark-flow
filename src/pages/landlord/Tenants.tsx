import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { mockTenants, formatDate } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function Tenants() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const filtered = mockTenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Tenants</h1><p className="text-muted-foreground">{mockTenants.length} tenants</p></div>
        <Button onClick={() => setDialogOpen(true)}><UserPlus className="mr-2 h-4 w-4" /> Invite Tenant</Button>
      </div>
      <Input placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Unit</TableHead><TableHead>Property</TableHead><TableHead>Payment</TableHead><TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.email}</TableCell>
                  <TableCell>{t.phone}</TableCell>
                  <TableCell>{t.unitNumber || '—'}</TableCell>
                  <TableCell>{t.propertyName || '—'}</TableCell>
                  <TableCell><StatusBadge status={t.paymentStatus} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(t.joinedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Tenant</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Jane Doe" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="tenant@example.com" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="+250 788 000 000" /></div>
          </div>
          <DialogFooter><Button onClick={() => setDialogOpen(false)}>Send Invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
