import { useState } from 'react';
import { Loader2, Search, UserPlus, Mail, Clock, Send, Activity, Trash2, RotateCw, ChevronRight, MoreVertical, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenants, useInvitations, formatDate, useResendInvitation, useCancelInvitation, useUpdateTenantProfile, useRemoveTenant } from '@/hooks/useSupabaseData';
import { InviteTenantDialog } from '@/components/tenants/InviteTenantDialog';
import { cn } from '@/lib/utils';

export default function Tenants() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: tenants, isLoading } = useTenants();
  const { data: invitations, isLoading: invLoading } = useInvitations();
  const [search, setSearch] = useState('');
  const resendInvite = useResendInvitation();
  const cancelInvite = useCancelInvitation();
  const removeTenant = useRemoveTenant();
  const updateTenant = useUpdateTenantProfile();
  
  const [deleteTenantTarget, setDeleteTenantTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTenantTarget, setEditTenantTarget] = useState<{ id: string; name: string; phone: string } | null>(null);

  const filtered = (tenants ?? []).filter(t => {
    const user = t.user as any;
    return user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
           user?.email?.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy transition-colors">Management</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">Tenants Directory</span>
          </p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy tracking-tight">Tenants Directory</h1>
          <p className="page-description font-medium text-muted-foreground">
            {tenants?.length === 0 
              ? "No tenants yet — add someone to your workspace"
              : `Manage your ${tenants?.length} active tenant${tenants?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Button 
          onClick={() => setInviteOpen(true)}
          className="rounded-xl bg-bizrent-navy hover:bg-bizrent-navy/90 text-white font-bold h-12 px-6 shadow-lg shadow-bizrent-navy/10 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          Invite New Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main List */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center max-w-sm relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-bizrent-blue" />
            <Input 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-11 h-11 rounded-xl bg-white border-border/50 shadow-sm focus-visible:ring-bizrent-navy/20 text-sm font-medium transition-all" 
            />
          </div>

          <Card className="overflow-hidden border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20 bg-muted/20 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                      <th className="text-left px-8 py-4 whitespace-nowrap">Name</th>
                      <th className="text-left px-4 py-4">Contact Info</th>
                      <th className="text-left px-8 py-4">Joined Date</th>
                      <th className="text-right px-8 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:nth-child(even)]:bg-muted/5">
                    {filtered.map(t => {
                      const user = t.user as any;
                      return (
                        <tr key={t.user_id} className="transition-all hover:bg-muted/10 border-b border-border/10 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-bizrent-blue/10 text-bizrent-blue flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-all">
                                {user?.full_name?.charAt(0) || 'U'}
                              </div>
                              <span className="font-extrabold text-bizrent-navy">{user?.full_name ?? '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground font-semibold text-xs">{user?.email ?? '—'}</span>
                              <span className="text-[11px] font-bold text-bizrent-slate">{user?.phone ?? '—'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-muted-foreground text-xs font-bold">{formatDate(t.created_at)}</td>
                          <td className="px-8 py-5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-border/40">
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer py-2 px-3 font-medium rounded-lg hover:bg-slate-50 hover:text-bizrent-navy transition-colors"
                                  onClick={() => setEditTenantTarget({ id: user?.id, name: user?.full_name || '', phone: user?.phone || '' })}
                                >
                                  <Edit2 className="h-4 w-4" /> Edit Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-2 cursor-pointer py-2 px-3 text-bizrent-red font-medium rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                                  onClick={() => setDeleteTenantTarget({ id: user?.id, name: user?.full_name })}
                                >
                                  <Trash2 className="h-4 w-4" /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                            <Activity className="h-10 w-10 mb-2 opacity-10" />
                            <p className="font-bold text-bizrent-navy">No active tenants found</p>
                            <p className="text-xs font-medium mt-1">Try adjusting your search criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Pending Invitations */}
        <div className="xl:col-span-4">
          <Card className="border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white sticky top-6 overflow-hidden">
            <CardHeader className="pt-7 px-8 pb-4">
              <CardTitle className="text-lg font-extrabold text-bizrent-navy flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#ffcc00]" />
                Pending Invites
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-2">
              <div className="space-y-4">
                {invLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-12" /></div>
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))
                ) : (
                  <>
                    {(invitations ?? []).map(inv => (
                      <div key={inv.id} className="p-4 rounded-2xl border border-border/50 bg-muted/30 space-y-2 group hover:border-[#ffcc00]/50 transition-all relative">
                        <div className="flex justify-between items-start pr-12">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[13px] font-bold text-bizrent-navy truncate max-w-[140px] cursor-help">{inv.email}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{inv.email}</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-[9px] font-extrabold bg-[#ffcc00]/20 text-[#8a6e00] px-2 py-0.5 rounded-full uppercase tracking-tighter">Sent</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          Invited {formatDate(inv.created_at)}
                        </div>
                        <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-bizrent-blue/10 hover:text-bizrent-blue" onClick={() => resendInvite.mutate(inv)}>
                                <RotateCw className={cn("h-3 w-3", resendInvite.isPending && resendInvite.variables?.id === inv.id ? "animate-spin" : "")} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p className="text-xs">Resend Invite</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600" onClick={() => cancelInvite.mutate(inv.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p className="text-xs">Cancel Invite</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                    {(invitations ?? []).length === 0 && (
                      <div className="text-center py-10 px-4 border-2 border-dashed border-muted rounded-[2rem] bg-muted/10">
                        <p className="text-xs font-bold text-muted-foreground/60 italic leading-relaxed">Your invitation list <br/> is currently empty</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InviteTenantDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <Dialog open={!!deleteTenantTarget} onOpenChange={open => { if (!open) setDeleteTenantTarget(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-extrabold text-bizrent-navy">Remove Tenant?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium">
              Are you sure you want to remove <strong>{deleteTenantTarget?.name}</strong> from your workspace? They will no longer be able to submit payments or view invoices for your properties.
            </DialogDescription>
          </div>
          <DialogFooter className="gap-2 mt-8 sm:justify-center w-full flex-col sm:flex-row">
            <Button variant="outline" className="rounded-xl font-bold h-11 sm:flex-1" onClick={() => setDeleteTenantTarget(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl font-bold h-11 sm:flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
              onClick={async () => {
                if (deleteTenantTarget) {
                  await removeTenant.mutateAsync(deleteTenantTarget.id);
                  setDeleteTenantTarget(null);
                }
              }}
              disabled={removeTenant.isPending}
            >
              {removeTenant.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {removeTenant.isPending ? 'Removing...' : 'Remove Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTenantTarget} onOpenChange={open => { if (!open) setEditTenantTarget(null); }}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-bizrent-navy">Edit Tenant Profile</DialogTitle>
            <DialogDescription className="font-medium text-sm mt-1 text-muted-foreground">
              Update the contact details for this tenant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-bizrent-navy font-bold px-1">Full Name</Label>
              <Input 
                placeholder="John Doe" 
                className="rounded-2xl h-12 border-border/60 focus-visible:ring-bizrent-blue/20"
                value={editTenantTarget?.name || ''}
                onChange={e => setEditTenantTarget(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-bizrent-navy font-bold px-1">Phone Number</Label>
              <Input 
                placeholder="+250 7XX XXX XXX" 
                className="rounded-2xl h-12 border-border/60 focus-visible:ring-bizrent-blue/20"
                value={editTenantTarget?.phone || ''}
                onChange={e => setEditTenantTarget(prev => prev ? { ...prev, phone: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setEditTenantTarget(null)}>Cancel</Button>
            <Button 
              className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-bold h-12 px-8 shadow-lg shadow-bizrent-navy/10"
              onClick={async () => {
                if (editTenantTarget) {
                  await updateTenant.mutateAsync({ user_id: editTenantTarget.id, full_name: editTenantTarget.name, phone: editTenantTarget.phone });
                  setEditTenantTarget(null);
                }
              }}
              disabled={updateTenant.isPending || !editTenantTarget?.name.trim()}
            >
              {updateTenant.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {updateTenant.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}