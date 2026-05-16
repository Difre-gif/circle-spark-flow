import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Users, Shield, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useProperty, useUnits, formatRWF, usePropertyManagers, useTeamMembers, useAssignManager, useRemoveManager, useUpdateUnit } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

function InlineRentEdit({ unit, updateUnit }: { unit: any, updateUnit: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [rent, setRent] = useState(unit.monthly_rent || 0);

  const handleSave = async () => {
    await updateUnit.mutateAsync({ id: unit.id, monthly_rent: rent });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input type="number" className="w-24 h-8 text-xs font-bold font-mono" value={rent || ''} onChange={e => setRent(Number(e.target.value))} autoFocus />
        <Button size="sm" className="h-8 bg-bizrent-emerald hover:bg-bizrent-emerald/90 text-white font-semibold rounded-lg px-3" onClick={handleSave} disabled={updateUnit.isPending}>
          {updateUnit.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground rounded-lg" onClick={() => { setIsEditing(false); setRent(unit.monthly_rent); }}>✕</Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 group cursor-pointer hover:bg-muted/40 p-1.5 -ml-1.5 rounded-lg transition-colors w-fit" onClick={() => setIsEditing(true)}>
      <span className="font-bold text-bizrent-slate font-mono font-bold">{formatRWF(unit.monthly_rent)}</span>
      <Edit2 className="h-3.5 w-3.5 text-bizrent-blue opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function PropertyDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, orgRole, isSuperAdmin } = useAuth();
  const isOwner = orgRole === 'OWNER' || isSuperAdmin;
  
  const { data: property, isLoading: propLoading } = useProperty(id);
  const { data: units, isLoading: unitsLoading } = useUnits(id);
  const { data: managers, isLoading: mgrLoading } = usePropertyManagers(id);
  const { data: teamMembers } = useTeamMembers();
  
  const assignManager = useAssignManager();
  const removeManager = useRemoveManager();
  const [selectedMgr, setSelectedMgr] = useState<string>('');
  const updateUnit = useUpdateUnit();

  if (propLoading || unitsLoading || mgrLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-bizrent-navy dark:text-white" /></div>;
  if (!property) return <div className="text-center py-12 text-muted-foreground">{t('legacy.propertyNotFound')}</div>;

  const occupiedCount = units?.filter(u => u.status === 'OCCUPIED').length ?? 0;
  const totalCount = units?.length ?? 0;
  
  // Filter team members who are eligible (MANAGER role) and not already assigned
  const eligibleTeam = teamMembers?.filter(m => 
    m.role === 'MANAGER' && !managers?.some(assigned => assigned.user_id === m.user_id)
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4 bg-card p-6 rounded-[2rem] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] border border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-muted/40 hover:bg-muted shrink-0" onClick={() => navigate('/landlord/properties')}>
            <ArrowLeft className="h-5 w-5 text-bizrent-navy dark:text-white" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-bizrent-navy dark:text-white">{property.name}</h1>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
              <span>{property.address_line1}, {property.district}, {property.city}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300"></span>
              <span className="font-bold text-bizrent-blue tracking-widest uppercase text-xxs">{property.property_type}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={property.is_active ? 'ACTIVE' : 'INACTIVE'} />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="rounded-[2rem] border-0 shadow-sm bg-indigo-50/50">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">{t('legacy.totalUnits')}</p>
            <p className="text-4xl font-extrabold text-indigo-950">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-sm bg-emerald-50/50">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">{t('legacy.occupied')}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-emerald-900">{occupiedCount}</p>
              <p className="text-sm font-semibold text-emerald-600/70">/ {totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-0 shadow-sm bg-blue-50/50">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{t('legacy.occupancyRate')}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-extrabold text-bizrent-blue">{totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0}</p>
              <p className="text-xl font-bold text-bizrent-blue/50">%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 rounded-[2rem] border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-lg font-bold text-bizrent-navy dark:text-white">{t('legacy.units')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-card border-b border-border/40">
                    <TableHead className="font-bold text-xxs uppercase tracking-widest text-muted-foreground px-8 py-4">{t('legacy.unit')}</TableHead>
                    <TableHead className="font-bold text-xxs uppercase tracking-widest text-muted-foreground py-4">{t('legacy.type')}</TableHead>
                    <TableHead className="font-bold text-xxs uppercase tracking-widest text-muted-foreground py-4">{t('legacy.monthlyRent')}</TableHead>
                    <TableHead className="font-bold text-xxs uppercase tracking-widest text-muted-foreground px-8 py-4 text-right">{t('legacy.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(units ?? []).map(u => (
                    <TableRow key={u.id} className="border-b border-border/20 transition-colors hover:bg-muted/20">
                      <TableCell className="px-8 py-4">
                        <div className="font-bold text-bizrent-navy dark:text-white">{u.unit_number}</div>
                        {u.floor && <div className="text-xxs font-semibold text-muted-foreground">Floor {u.floor}</div>}
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground text-xs">{u.unit_type}</TableCell>
                      <TableCell>
                        <InlineRentEdit unit={u} updateUnit={updateUnit} />
                      </TableCell>
                      <TableCell className="px-8 py-4 text-right"><StatusBadge status={u.status} /></TableCell>
                    </TableRow>
                  ))}
                  {(!units || units.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-medium">{t('legacy.noUnitsFoundForThisProperty')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Property Managers Section */}
        <Card className="rounded-[2rem] border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card">
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-md font-bold text-bizrent-navy dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-bizrent-blue" />
              {t('legacy.propertyManagers')}
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
              {t('legacy.staffWithIsolatedAccessToThisBuilding')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {(managers ?? []).length > 0 ? (
              <div className="space-y-3">
                {managers!.map(mgr => {
                  const u = mgr.user as any;
                  return (
                    <div key={mgr.user_id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-bizrent-blue/10 text-bizrent-blue flex items-center justify-center font-bold text-xs">
                          {u?.full_name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-bizrent-navy dark:text-white leading-none">{u?.full_name}</p>
                          <p className="text-xxs font-medium text-muted-foreground mt-0.5">{u?.email}</p>
                        </div>
                      </div>
                      {isOwner && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeManager.mutate({ property_id: property.id, user_id: mgr.user_id })}
                          disabled={removeManager.isPending}
                        >
                          {removeManager.isPending && removeManager.variables?.user_id === mgr.user_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-muted/40 border border-dashed border-border rounded-xl">
                <Users className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-muted-foreground">{t('legacy.noManagersAssigned')}</p>
                <p className="text-xxs text-muted-foreground mt-1">{t('legacy.ownersCanSeeEverything')}</p>
              </div>
            )}

            {isOwner && (
              <div className="pt-2 flex items-center gap-2">
                <Select value={selectedMgr} onValueChange={setSelectedMgr}>
                  <SelectTrigger className="flex-1 h-9 rounded-lg text-xs font-semibold focus:ring-bizrent-blue/20">
                    <SelectValue placeholder="Assign a manager..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {eligibleTeam.length === 0 ? (
                      <SelectItem value="none" disabled className="text-xs font-medium">{t('legacy.noAvailableManagers')}</SelectItem>
                    ) : (
                      eligibleTeam.map(team => {
                        const u = team.user as any;
                        return (
                          <SelectItem key={team.user_id} value={team.user_id} className="text-xs font-bold">
                            {u?.full_name}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                <Button 
                  size="icon" 
                  className="h-9 w-9 rounded-lg bg-bizrent-navy hover:bg-bizrent-navy/90 shrink-0"
                  onClick={() => {
                    if (selectedMgr && selectedMgr !== 'none') {
                      assignManager.mutate({ property_id: property.id, user_id: selectedMgr });
                      setSelectedMgr('');
                    }
                  }}
                  disabled={!selectedMgr || selectedMgr === 'none' || assignManager.isPending}
                >
                  {assignManager.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}