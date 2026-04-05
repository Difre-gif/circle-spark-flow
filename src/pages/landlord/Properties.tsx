import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Building } from 'lucide-react';
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-description">Manage {properties?.length ?? 0} properties in your portfolio</p>
        </div>
        <Button className="bg-bizrent-blue hover:bg-bizrent-navy text-white shadow-sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Property
        </Button>
      </div>

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-bizrent-navy py-4">Property Name</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Type</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Location</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4 text-center">Total Units</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(properties ?? []).map(p => (
                <TableRow key={p.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => navigate(`/landlord/properties/${p.id}`)}>
                  <TableCell className="font-bold text-bizrent-navy">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-bizrent-navy/5 rounded-md">
                        <Building className="h-4 w-4 text-bizrent-blue" />
                      </div>
                      {p.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">{p.property_type.replace('_', ' ')}</TableCell>
                  <TableCell className="text-muted-foreground">{p.district}, {p.city}</TableCell>
                  <TableCell className="text-center font-medium">{p.total_units}</TableCell>
                  <TableCell><StatusBadge status={p.is_active ? 'ACTIVE' : 'INACTIVE'} /></TableCell>
                </TableRow>
              ))}
              {(!properties || properties.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Building className="h-10 w-10 mb-3 text-muted-foreground/50" />
                      <p className="text-lg font-medium text-bizrent-navy">No properties yet</p>
                      <p className="text-sm">Add your first property to get started.</p>
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
            <DialogTitle className="text-xl font-bold text-bizrent-navy">Add New Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-semibold">Property Name</Label>
              <Input placeholder="e.g. Sunrise Apartments" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="focus-visible:ring-bizrent-blue" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Property Type</Label>
              <Select value={form.property_type} onValueChange={v => setForm(f => ({ ...f, property_type: v }))}>
                <SelectTrigger className="focus:ring-bizrent-blue">
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APARTMENT">Apartment Building</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial Plaza</SelectItem>
                  <SelectItem value="OFFICE">Office Block</SelectItem>
                  <SelectItem value="MIXED_USE">Mixed Use Building</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Address Line 1</Label>
              <Input placeholder="e.g. KG 11 Ave" value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} className="focus-visible:ring-bizrent-blue" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">City</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="focus-visible:ring-bizrent-blue" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">District</Label>
                <Input placeholder="e.g. Gasabo" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="focus-visible:ring-bizrent-blue" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-bizrent-blue hover:bg-bizrent-navy" onClick={handleCreate} disabled={createProperty.isPending}>
              {createProperty.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createProperty.isPending ? 'Saving...' : 'Save Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}