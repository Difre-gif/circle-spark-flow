import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties, useCreateProperty } from '@/hooks/useSupabaseData';

export default function Properties() {
  const navigate = useNavigate();
  const { data: properties, isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', property_type: '', address_line1: '', city: 'Kigali', district: '' });

  const handleCreate = async () => {
    if (!form.name || !form.property_type || !form.address_line1) return;
    await createProperty.mutateAsync(form);
    setDialogOpen(false);
    setForm({ name: '', property_type: '', address_line1: '', city: 'Kigali', district: '' });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground">{properties?.length ?? 0} properties in your portfolio</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Property</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Units</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(properties ?? []).map(p => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/landlord/properties/${p.id}`)}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.property_type}</TableCell>
                  <TableCell className="text-muted-foreground">{p.district}, {p.city}</TableCell>
                  <TableCell>{p.total_units}</TableCell>
                  <TableCell><StatusBadge status={p.is_active ? 'ACTIVE' : 'INACTIVE'} /></TableCell>
                </TableRow>
              ))}
              {(!properties || properties.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No properties yet. Add your first property!</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Property</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Property Name</Label><Input placeholder="e.g. Sunrise Apartments" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Type</Label>
              <Select value={form.property_type} onValueChange={v => setForm(f => ({ ...f, property_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="OFFICE">Office</SelectItem>
                  <SelectItem value="KIOSK">Kiosk</SelectItem>
                  <SelectItem value="MIXED_USE">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input placeholder="KG 11 Ave" value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div className="space-y-2"><Label>District</Label><Input placeholder="Gasabo" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleCreate} disabled={createProperty.isPending}>{createProperty.isPending ? 'Saving...' : 'Save Property'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
