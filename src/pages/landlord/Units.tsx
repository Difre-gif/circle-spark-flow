import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnits, useProperties, useCreateUnit, formatRWF } from '@/hooks/useSupabaseData';

export default function Units() {
  const { data: units, isLoading } = useUnits();
  const { data: properties } = useProperties();
  const createUnit = useCreateUnit();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ property_id: '', unit_number: '', unit_type: '', monthly_rent: 0 });

  const filtered = (units ?? []).filter(u =>
    u.unit_number.toLowerCase().includes(search.toLowerCase()) ||
    ((u as any).properties?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.property_id || !form.unit_number || !form.unit_type || !form.monthly_rent) return;
    await createUnit.mutateAsync(form);
    setDialogOpen(false);
    setForm({ property_id: '', unit_number: '', unit_type: '', monthly_rent: 0 });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Units</h1><p className="text-muted-foreground">{units?.length ?? 0} total units</p></div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Unit</Button>
      </div>
      <Input placeholder="Search units..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Unit #</TableHead><TableHead>Property</TableHead><TableHead>Type</TableHead><TableHead>Rent</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.unit_number}</TableCell>
                  <TableCell>{(u as any).properties?.name ?? '—'}</TableCell>
                  <TableCell>{u.unit_type}</TableCell>
                  <TableCell>{formatRWF(u.monthly_rent)}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No units found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Unit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Property</Label>
              <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {(properties ?? []).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Unit Number</Label><Input placeholder="A-301" value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Type</Label>
              <Select value={form.unit_type} onValueChange={v => setForm(f => ({ ...f, unit_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDIO">Studio</SelectItem><SelectItem value="1BED">1 Bedroom</SelectItem><SelectItem value="2BED">2 Bedroom</SelectItem><SelectItem value="3BED">3 Bedroom</SelectItem><SelectItem value="KIOSK">Kiosk</SelectItem><SelectItem value="OFFICE">Office</SelectItem><SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Monthly Rent (RWF)</Label><Input type="number" placeholder="300000" value={form.monthly_rent || ''} onChange={e => setForm(f => ({ ...f, monthly_rent: Number(e.target.value) }))} /></div>
          </div>
          <DialogFooter><Button onClick={handleCreate} disabled={createUnit.isPending}>{createUnit.isPending ? 'Saving...' : 'Save Unit'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
