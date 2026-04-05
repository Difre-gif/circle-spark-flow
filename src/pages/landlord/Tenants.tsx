import { useState } from 'react';
import { Loader2, Search, UserPlus, Mail, Clock, Send, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenants, useInvitations, formatDate } from '@/hooks/useSupabaseData';
import { InviteTenantDialog } from '@/components/tenants/InviteTenantDialog';

export default function Tenants() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: tenants, isLoading } = useTenants();
  const { data: invitations, isLoading: invLoading } = useInvitations();
  const [search, setSearch] = useState('');

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
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest mb-1">Management / Tenants</p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy tracking-tight">Tenants Directory</h1>
          <p className="page-description font-medium text-muted-foreground">Manage and monitor your {tenants?.length ?? 0} active tenants</p>
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
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-20 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center">
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
                      <div key={inv.id} className="p-4 rounded-2xl border border-border/50 bg-muted/30 space-y-2 group hover:border-[#ffcc00]/50 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[13px] font-bold text-bizrent-navy truncate max-w-[180px]">{inv.email}</span>
                          <span className="text-[9px] font-extrabold bg-[#ffcc00]/20 text-[#8a6e00] px-2 py-0.5 rounded-full uppercase tracking-tighter">Sent</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          Invited {formatDate(inv.created_at)}
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
    </div>
  );
}