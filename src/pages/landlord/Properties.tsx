import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest">Management / Properties</p>
          <h1 className="page-title">Properties</h1>
          <p className="page-description">Manage {properties?.length ?? 0} properties in your portfolio</p>
        </div>
        <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white shadow-sm rounded-xl font-semibold mt-4 md:mt-0" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Property
        </Button>
      </div>

      <Card className="overflow-hidden border-0 rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="text-left px-6 py-4 whitespace-nowrap">Property Name</th>
                  <th className="text-left px-6 py-4">Type</th>
                  <th className="text-left px-6 py-4">Location</th>
                  <th className="text-center px-6 py-4">Total Units</th>
                  <th className="text-center px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/10">
                {(properties ?? []).map(p => (
                  <tr key={p.id} className="cursor-pointer transition-colors hover:bg-muted/30 border-b border-border/20" onClick={() => navigate(`/landlord/properties/${p.id}`)}>
                    <td className="px-6 py-4 font-bold text-bizrent-navy">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bizrent-navy/5 rounded-md">
                          <Building className="h-4 w-4 text-bizrent-blue" />
                        </div>
                        {p.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium capitalize">{p.property_type.toLowerCase().replace('_', ' ')}</td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{p.district ? `${p.district}, ` : ''}{p.city}</td>
                    <td className="px-6 py-4 text-center font-bold text-bizrent-navy font-tabular-nums">{p.total_units}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={p.is_active ? 'ACTIVE' : 'INACTIVE'} /></td>
                  </tr>
                ))}
                {(!properties || properties.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Building className="h-8 w-8 mb-2 opacity-20" />
                        <p className="font-medium text-bizrent-navy">No properties yet</p>
                        <p className="text-sm mt-1">Add your first property to get started.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy">Add New Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Property Name</Label>
              <Input placeholder="e.g. Sunrise Apartments" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="focus-visible:ring-bizrent-blue/20" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Property Type</Label>
              <Select value={form.property_type} onValueChange={v => setForm(f => ({ ...f, property_type: v }))}>
                <SelectTrigger className="focus:ring-bizrent-blue/20">
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
              <Label className="font-semibold text-bizrent-navy">Address Line 1</Label>
              <Input placeholder="e.g. KG 11 Ave" value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} className="focus-visible:ring-bizrent-blue/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy">City</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="focus-visible:ring-bizrent-blue/20" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy">District</Label>
                <Input placeholder="e.g. Gasabo" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="focus-visible:ring-bizrent-blue/20" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 rounded-xl font-semibold" onClick={handleCreate} disabled={createProperty.isPending}>
              {createProperty.isPending ? 'Saving...' : 'Save Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}