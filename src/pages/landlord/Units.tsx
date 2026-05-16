import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Loader2, Home, Search, Edit2, Trash2, MoreVertical, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnits, useProperties, useCreateUnit, useDeleteUnit, useUpdateUnit, formatRWF } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/lib/permissions';

export default function Units() {
  const { t } = useTranslation();
  const { orgRole } = useAuth();
  const { data: units, isLoading } = useUnits();
  const { data: properties } = useProperties();
  const createUnit = useCreateUnit();
  const deleteUnit = useDeleteUnit();
  const updateUnit = useUpdateUnit();
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; unit_number: string; unit_type: string; monthly_rent: number } | null>(null);
  const [form, setForm] = useState({ property_id: '', unit_number: '', unit_type: '', monthly_rent: 0 });

  const filtered = (units ?? []).filter(u => {
    const matchesSearch = u.unit_number.toLowerCase().includes(search.toLowerCase()) ||
                          ((u as any).properties?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesProperty = propertyFilter === 'ALL' || u.property_id === propertyFilter;
    return matchesSearch && matchesProperty;
  });

  const handleCreate = async () => {
    if (!form.property_id || !form.unit_number || !form.unit_type || !form.monthly_rent) return;
    await createUnit.mutateAsync(form);
    setDialogOpen(false);
    setForm({ property_id: '', unit_number: '', unit_type: '', monthly_rent: 0 });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteUnit.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    await updateUnit.mutateAsync({ id: editTarget.id, unit_number: editTarget.unit_number, unit_type: editTarget.unit_type, monthly_rent: editTarget.monthly_rent });
    setEditTarget(null);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy dark:text-white" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy dark:text-white transition-colors">{t('legacy.management')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">{t('legacy.units')}</span>
          </p>
          <h1 className="page-title">{t('legacy.units')}</h1>
          <p className="page-description">Manage {units?.length ?? 0} individual rental units</p>
        </div>
        {can(orgRole ?? '', 'unit:create') && <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white shadow-sm rounded-xl font-semibold mt-4 md:mt-0" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('legacy.addUnit')}
        </Button>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by unit number or property..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 h-11 rounded-full bg-card border-border/50 shadow-sm focus-visible:ring-bizrent-blue/20/20 text-sm font-medium w-full"
          />
        </div>
        <Select value={propertyFilter} onValueChange={setPropertyFilter}>
          <SelectTrigger className="w-full sm:w-[250px] h-11 bg-card border-border/50 shadow-sm focus:ring-bizrent-blue/20 font-medium rounded-full">
            <SelectValue placeholder="Filter by property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('legacy.allProperties')}</SelectItem>
            {(properties ?? []).map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-0 rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="text-left px-6 py-4 whitespace-nowrap">Unit #</th>
                  <th className="text-left px-6 py-4">{t('legacy.property')}</th>
                  <th className="text-left px-6 py-4">{t('legacy.type')}</th>
                  <th className="text-right px-6 py-4">{t('legacy.monthlyRent')}</th>
                  <th className="text-center px-6 py-4">{t('legacy.status')}</th>
                  <th className="text-right px-6 py-4">{t('legacy.actions')}</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/40">
                {filtered.map(u => (
                  <tr key={u.id} className="transition-colors hover:bg-card border-b border-border/20">
                    <td className="px-6 py-4 font-bold text-bizrent-navy dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bizrent-blue/10 rounded-md">
                          <Home className="h-4 w-4 text-bizrent-blue" />
                        </div>
                        {u.unit_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{(u as any).properties?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{u.unit_type.toLowerCase()}</td>
                    <td className="px-6 py-4 font-semibold text-bizrent-slate font-mono font-bold text-right">{formatRWF(u.monthly_rent)}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={u.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-border/40">
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer py-2 px-3 font-medium rounded-lg hover:bg-muted/40 hover:text-bizrent-blue transition-colors"
                            onClick={() => setEditTarget({ id: u.id, unit_number: u.unit_number, unit_type: u.unit_type, monthly_rent: u.monthly_rent })}
                          >
                            <Edit2 className="h-4 w-4" /> {t('legacy.editUnit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer py-2 px-3 text-bizrent-red font-medium rounded-lg hover:bg-red-50 hover:text-bizrent-red transition-colors focus:text-red-700 focus:bg-red-50"
                            onClick={() => setDeleteTarget({ id: u.id, name: u.unit_number })}
                          >
                            <Trash2 className="h-4 w-4" /> {t('legacy.deleteUnit')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                          <Home className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="font-bold text-bizrent-navy dark:text-white text-lg">{t('legacy.noUnitsFound')}</p>
                        <p className="text-sm mt-2 font-medium mb-6 px-4">
                          {search || propertyFilter !== 'ALL'
                            ? "Try adjusting your search keywords or property filters."
                            : "Add your first unit to start managing tenancies and collecting rent."}
                        </p>
                        <Button
                          className="rounded-xl font-bold h-11 px-8 bg-bizrent-navy hover:bg-bizrent-navy/90 text-white shadow-lg shadow-bizrent-navy/10"
                          onClick={() => setDialogOpen(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" /> {t('legacy.addUnit')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Unit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy dark:text-white">{t('legacy.addNewUnit')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy dark:text-white">{t('legacy.selectProperty')}</Label>
              <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
                <SelectTrigger className="focus:ring-bizrent-blue/20">
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {(properties ?? []).map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy dark:text-white">{t('legacy.unitNumberName')}</Label>
                <Input placeholder="e.g. A-301" value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} className="focus-visible:ring-bizrent-blue/20" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy dark:text-white">{t('legacy.unitType')}</Label>
                <Select value={form.unit_type} onValueChange={v => setForm(f => ({ ...f, unit_type: v }))}>
                  <SelectTrigger className="focus:ring-bizrent-blue/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDIO">{t('legacy.studio')}</SelectItem>
                    <SelectItem value="1BED">1 Bedroom</SelectItem>
                    <SelectItem value="2BED">2 Bedroom</SelectItem>
                    <SelectItem value="3BED">3 Bedroom</SelectItem>
                    <SelectItem value="OFFICE">{t('legacy.officeSpace')}</SelectItem>
                    <SelectItem value="KIOSK">{t('legacy.retailKiosk')}</SelectItem>
                    <SelectItem value="OTHER">{t('legacy.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-bizrent-navy dark:text-white">Monthly Rent (RWF)</Label>
              <Input type="number" placeholder="e.g. 300000" value={form.monthly_rent || ''} onChange={e => setForm(f => ({ ...f, monthly_rent: Number(e.target.value) }))} className="focus-visible:ring-bizrent-blue/20 font-mono" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setDialogOpen(false)}>{t('legacy.cancel')}</Button>
            <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 rounded-xl font-semibold" onClick={handleCreate} disabled={createUnit.isPending}>
              {createUnit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createUnit.isPending ? 'Saving...' : 'Save Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy dark:text-white">{t('legacy.editUnit')}</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy dark:text-white">{t('legacy.unitNumberName')}</Label>
                <Input value={editTarget.unit_number} onChange={e => setEditTarget(t => t ? { ...t, unit_number: e.target.value } : t)} className="focus-visible:ring-bizrent-blue/20" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy dark:text-white">{t('legacy.unitType')}</Label>
                <Select value={editTarget.unit_type} onValueChange={v => setEditTarget(t => t ? { ...t, unit_type: v } : t)}>
                  <SelectTrigger className="focus:ring-bizrent-blue/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDIO">{t('legacy.studio')}</SelectItem>
                    <SelectItem value="1BED">1 Bedroom</SelectItem>
                    <SelectItem value="2BED">2 Bedroom</SelectItem>
                    <SelectItem value="3BED">3 Bedroom</SelectItem>
                    <SelectItem value="OFFICE">{t('legacy.officeSpace')}</SelectItem>
                    <SelectItem value="KIOSK">{t('legacy.retailKiosk')}</SelectItem>
                    <SelectItem value="OTHER">{t('legacy.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-bizrent-navy dark:text-white">Monthly Rent (RWF)</Label>
                <Input type="number" value={editTarget.monthly_rent || ''} onChange={e => setEditTarget(t => t ? { ...t, monthly_rent: Number(e.target.value) } : t)} className="focus-visible:ring-bizrent-blue/20 font-mono" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setEditTarget(null)}>{t('legacy.cancel')}</Button>
            <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 rounded-xl font-semibold" onClick={handleEditSave} disabled={updateUnit.isPending}>
              {updateUnit.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('legacy.saving')}</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-bizrent-navy dark:text-white">{t('legacy.deleteUnit')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {t('legacy.areYouSureYouWantToDelete')} <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" className="rounded-xl font-semibold" onClick={() => setDeleteTarget(null)}>{t('legacy.cancel')}</Button>
            <Button variant="destructive" className="rounded-xl font-semibold" onClick={handleDeleteConfirm} disabled={deleteUnit.isPending}>
              {deleteUnit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleteUnit.isPending ? 'Deleting...' : 'Delete Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}