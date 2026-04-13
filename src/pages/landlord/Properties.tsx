import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, MoreVertical, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties, useCreateProperty, useUpdateProperty, useDeleteProperty } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/permissions';

export default function Properties() {
  const navigate = useNavigate();
  const { orgRole } = useAuth();
  const { data: properties, isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', property_type: '', address_line1: '', city: 'Kigali', district: '' });
  const [editTarget, setEditTarget] = useState<{ id: string; name: string; property_type: string; address_line1: string; city: string; district: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleCreate = async () => {
    if (!form.name || !form.property_type || !form.address_line1) return;
    await createProperty.mutateAsync(form);
    setDialogOpen(false);
    setForm({ name: '', property_type: '', address_line1: '', city: 'Kigali', district: '' });
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    await updateProperty.mutateAsync({ id: editTarget.id, name: editTarget.name, property_type: editTarget.property_type, address_line1: editTarget.address_line1, city: editTarget.city, district: editTarget.district });
    setEditTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteProperty.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const vacantUnits = (properties ?? []).reduce((acc, p) => {
    const total = p.total_units || 0;
    const occupied = p.occupied_units || 0;
    return acc + Math.max(0, total - occupied);
  }, 0);

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
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy transition-colors">Management</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">Properties</span>
          </p>
          <h1 className="page-title">Properties</h1>
          <p className="page-description">You manage {properties?.length ?? 0} propert{properties?.length === 1 ? 'y' : 'ies'}. {vacantUnits} units currently vacant.</p>
        </div>
        {can(orgRole ?? '', 'property:create') && (
          <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white shadow-sm rounded-xl font-semibold mt-4 md:mt-0" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(properties ?? []).map(p => {
          const total = p.total_units || 0;
          const occupied = p.occupied_units || 0;
          const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
          return (
            <Card key={p.id} className="overflow-hidden border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white group cursor-pointer hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bizrent-blue/20 transition-all" onClick={() => navigate(`/landlord/properties/${p.id}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/landlord/properties/${p.id}`); } }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-bizrent-navy/5 flex items-center justify-center text-bizrent-blue group-hover:scale-110 transition-transform shrink-0">
                      <Building className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-bizrent-navy text-lg line-clamp-1 group-hover:text-bizrent-blue transition-colors">{p.name}</h3>
                      <p className="text-sm font-medium text-muted-foreground truncate">{p.district ? `${p.district}, ` : ''}{p.city}</p>
                    </div>
                  </div>
                  {can(orgRole ?? '', 'property:edit') && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-border/40">
                          <DropdownMenuItem className="gap-2 cursor-pointer py-2 px-3 font-medium rounded-lg hover:bg-slate-50 hover:text-bizrent-blue transition-colors" onClick={() => setEditTarget({ id: p.id, name: p.name, property_type: p.property_type, address_line1: (p as any).address_line1 ?? '', city: (p as any).city ?? 'Kigali', district: (p as any).district ?? '' })}>
                            <Edit2 className="h-4 w-4" /> Edit Property
                          </DropdownMenuItem>
                          {can(orgRole ?? '', 'property:delete') && (
                            <DropdownMenuItem className="gap-2 cursor-pointer py-2 px-3 text-bizrent-red font-medium rounded-lg hover:bg-red-50 hover:text-bizrent-red transition-colors" onClick={() => setDeleteTarget({ id: p.id, name: p.name })}>
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Units</p>
                    <p className="font-extrabold text-xl text-bizrent-navy font-mono">{p.total_units}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Occupancy</p>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-xl text-bizrent-navy font-mono">{occupancyRate}%</p>
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-bizrent-blue rounded-full" style={{ width: `${occupancyRate}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(!properties || properties.length === 0) && (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-border/60 bg-transparent shadow-none rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="h-16 w-16 bg-bizrent-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-bizrent-blue/50" />
                </div>
                <p className="font-bold text-bizrent-navy text-lg">No properties yet</p>
                <p className="text-sm mt-1 text-muted-foreground font-medium mb-6">Add your first property to get started building your portfolio.</p>
                <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white shadow-lg shadow-bizrent-navy/10 rounded-xl font-bold h-12 px-8" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Property
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy">Add New Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Property Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Sunrise Apartments" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="focus-visible:ring-bizrent-blue/20" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy">Property Type <span className="text-red-500">*</span></Label>
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

      {/* Edit Property Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-bizrent-navy">Edit Property</DialogTitle></DialogHeader>
          {editTarget && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy">Property Name <span className="text-red-500">*</span></Label>
                <Input value={editTarget.name} onChange={e => setEditTarget(t => t ? { ...t, name: e.target.value } : t)} className="focus-visible:ring-bizrent-blue/20" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy">Property Type <span className="text-red-500">*</span></Label>
                <Select value={editTarget.property_type} onValueChange={v => setEditTarget(t => t ? { ...t, property_type: v } : t)}>
                  <SelectTrigger className="focus:ring-bizrent-blue/20"><SelectValue /></SelectTrigger>
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
                <Input value={editTarget.address_line1} onChange={e => setEditTarget(t => t ? { ...t, address_line1: e.target.value } : t)} className="focus-visible:ring-bizrent-blue/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-bizrent-navy">City</Label>
                  <Input value={editTarget.city} onChange={e => setEditTarget(t => t ? { ...t, city: e.target.value } : t)} className="focus-visible:ring-bizrent-blue/20" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-bizrent-navy">District</Label>
                  <Input value={editTarget.district} onChange={e => setEditTarget(t => t ? { ...t, district: e.target.value } : t)} className="focus-visible:ring-bizrent-blue/20" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 rounded-xl font-semibold" onClick={handleEditSave} disabled={updateProperty.isPending}>
              {updateProperty.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy">Remove Property</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? It will be hidden from your portfolio but data will be retained.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl font-semibold" onClick={handleDeleteConfirm} disabled={deleteProperty.isPending}>
              {deleteProperty.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing...</> : 'Remove Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}