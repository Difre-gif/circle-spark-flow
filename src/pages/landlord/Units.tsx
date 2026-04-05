import { useState } from 'react';
import { Plus, Loader2, Home, Search } from 'lucide-react';
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <h1 className="page-title">Units</h1>
          <p className="page-description">Manage {units?.length ?? 0} individual rental units</p>
        </div>
        <Button className="bg-bizrent-blue hover:bg-bizrent-navy text-white shadow-sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Unit
        </Button>
      </div>

      <div className="flex items-center max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by unit number or property..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-9 bg-white shadow-sm focus-visible:ring-bizrent-blue" 
        />
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-bizrent-navy py-4">Unit #</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Property</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Type</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Monthly Rent</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(u => (
                <TableRow key={u.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-bold text-bizrent-navy">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bizrent-blue/10 rounded-md">
                        <Home className="h-4 w-4 text-bizrent-blue" />
                      </div>
                      {u.unit_number}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">{(u as any).properties?.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{u.unit_type}</TableCell>
                  <TableCell className="font-semibold">{formatRWF(u.monthly_rent)}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Home className="h-10 w-10 mb-3 text-muted-foreground/50" />
                      <p className="text-lg font-medium text-bizrent-navy">No units found</p>
                      <p className="text-sm">Try adjusting your search or add a new unit.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy">Add New Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-semibold">Select Property</Label>
              <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
                <SelectTrigger className="focus:ring-bizrent-blue">
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {(properties ?? []).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">Unit Number/Name</Label>
                <Input placeholder="e.g. A-301" value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} className="focus-visible:ring-bizrent-blue" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Unit Type</Label>
                <Select value={form.unit_type} onValueChange={v => setForm(f => ({ ...f, unit_type: v }))}>
                  <SelectTrigger className="focus:ring-bizrent-blue">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDIO">Studio</SelectItem>
                    <SelectItem value="1BED">1 Bedroom</SelectItem>
                    <SelectItem value="2BED">2 Bedroom</SelectItem>
                    <SelectItem value="3BED">3 Bedroom</SelectItem>
                    <SelectItem value="OFFICE">Office Space</SelectItem>
                    <SelectItem value="KIOSK">Retail Kiosk</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Monthly Rent (RWF)</Label>
              <Input type="number" placeholder="e.g. 300000" value={form.monthly_rent || ''} onChange={e => setForm(f => ({ ...f, monthly_rent: Number(e.target.value) }))} className="focus-visible:ring-bizrent-blue font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-bizrent-blue hover:bg-bizrent-navy" onClick={handleCreate} disabled={createUnit.isPending}>
              {createUnit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createUnit.isPending ? 'Saving...' : 'Save Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}