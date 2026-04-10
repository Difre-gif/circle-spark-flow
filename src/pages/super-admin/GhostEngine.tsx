import { useState } from 'react';
import { Ghost, Search, Shield, RefreshCw, Clock, Mail, AlertTriangle, KeyRound, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalUsers, useGlobalAuditLogs, formatDate } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function GhostEngine() {
  const { impersonateUser } = useAuth();
  const { data: users, isLoading: usersLoading } = useGlobalUsers();
  const { data: logs, isLoading: logsLoading } = useGlobalAuditLogs();
  const [search, setSearch] = useState('');
  const [pwResetTarget, setPwResetTarget] = useState<{ id: string; email: string; name: string } | null>(null);
  const [pwResetLoading, setPwResetLoading] = useState(false);

  const ghostLogs = (logs ?? []).filter(l =>
    (l.action as string).startsWith('SUPER_ADMIN_') ||
    (l.action as string).includes('IMPERSONAT')
  );

  const filtered = (users ?? []).filter(u => {
    const q = search.toLowerCase();
    return !q || u.email.includes(q) || (u.full_name ?? '').toLowerCase().includes(q);
  });

  const handleGhost = (u: any) => {
    const roles = u.roles ?? [];
    const primary = roles[0];
    if (!primary) { toast.error('User has no active org role'); return; }
    impersonateUser({
      id: u.id,
      name: u.full_name ?? u.email,
      email: u.email,
      phone: u.phone ?? '',
      role: primary.role === 'TENANT' ? 'tenant' : 'landlord',
      organisationId: primary.org_id,
    });
    toast.success(`Ghost session started as ${u.email}`);
  };

  const handleForcePasswordReset = async () => {
    if (!pwResetTarget) return;
    setPwResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(pwResetTarget.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(`Password reset email sent to ${pwResetTarget.email}`);
      setPwResetTarget(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPwResetLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Ghost className="h-5 w-5 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Ghost Engine</h1>
        </div>
        <p className="text-slate-400 text-sm">Inhabit any user account. Every action leaves an immutable audit trail.</p>
      </div>

      <Alert className="border-amber-500/30 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-amber-300 text-xs font-medium">
          All ghost sessions are logged with your Super Admin ID. Sessions expire after 15 minutes. Every action taken during impersonation is tagged in audit_logs.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="console">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="console" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">
            <Ghost className="h-3.5 w-3.5 mr-1.5" /> Impersonation Console
          </TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">
            <Clock className="h-3.5 w-3.5 mr-1.5" /> Ghost Session Log
          </TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">
            <KeyRound className="h-3.5 w-3.5 mr-1.5" /> Access Tools
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Impersonation Console ─── */}
        <TabsContent value="console" className="mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by email, name, or user ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">User</th>
                      <th className="text-left px-4 py-3">Orgs / Roles</th>
                      <th className="text-center px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        <td className="px-6 py-4"><Skeleton className="h-5 w-48 bg-slate-700" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-5 w-32 bg-slate-700" /></td>
                        <td className="px-4 py-4"><Skeleton className="h-8 w-24 bg-slate-700 mx-auto" /></td>
                      </tr>
                    )) : filtered.map(u => {
                      const roles: any[] = (u as any).roles ?? [];
                      const isSuperAdmin = u.email === 'fredricknjorogekariuki@gmail.com';
                      return (
                        <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white text-sm">{u.full_name ?? '—'}</p>
                                <p className="text-slate-400 text-xs">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {isSuperAdmin ? (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xxs">SUPER ADMIN</Badge>
                            ) : roles.length === 0 ? (
                              <span className="text-slate-500 text-xs italic">No roles</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {roles.slice(0, 3).map((r: any, i: number) => (
                                  <Badge key={i} className={`text-xxs ${r.role === 'OWNER' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : r.role === 'TENANT' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-600/50 text-slate-300 border-slate-600'}`}>
                                    {r.role}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40"
                                disabled={isSuperAdmin || roles.length === 0}
                                onClick={() => handleGhost(u)}
                              >
                                <Ghost className="h-3 w-3 mr-1" /> Ghost
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                                onClick={() => setPwResetTarget({ id: u.id, email: u.email, name: u.full_name ?? u.email })}
                              >
                                <KeyRound className="h-3 w-3 mr-1" /> Reset PW
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!usersLoading && filtered.length === 0 && (
                      <tr><td colSpan={3} className="py-12 text-center text-slate-500 text-sm">No users match your search</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Ghost Session Log ─── */}
        <TabsContent value="log" className="mt-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                Admin Action History
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xxs">{ghostLogs.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Timestamp</th>
                      <th className="text-left px-4 py-3">Actor</th>
                      <th className="text-left px-4 py-3">Action</th>
                      <th className="text-left px-4 py-3">Target Org</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsLoading ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        {[1,2,3,4].map(j => <td key={j} className="px-6 py-3"><Skeleton className="h-4 w-24 bg-slate-700" /></td>)}
                      </tr>
                    )) : ghostLogs.slice(0, 50).map(log => (
                      <tr key={log.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="px-6 py-3 text-slate-400 text-xs font-mono whitespace-nowrap">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-3 text-white text-xs">{(log.actor as any)?.full_name ?? (log.actor as any)?.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          <code className="text-xxs bg-slate-900/50 text-emerald-300 px-2 py-0.5 rounded">{log.action}</code>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{(log.org as any)?.name ?? '—'}</td>
                      </tr>
                    ))}
                    {!logsLoading && ghostLogs.length === 0 && (
                      <tr><td colSpan={4} className="py-10 text-center text-slate-500 text-sm">No super admin actions recorded yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 3: Access Tools ─── */}
        <TabsContent value="tools" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Eye, title: 'Active Sessions Monitor', desc: 'View all non-expired refresh tokens across all users. Terminate any session instantly.', tag: 'v2 — requires service role key' },
              { icon: KeyRound, title: 'Emergency Access Keys', desc: 'Generate single-use 1-hour login links for any user, bypassing password and 2FA.', tag: 'v2 — requires service role key' },
              { icon: Shield, title: '2FA Override', desc: 'Disable TOTP 2FA for any locked-out user. Sends security alert to their email.', tag: 'v2 — 2FA not yet enabled' },
              { icon: RefreshCw, title: 'Token Revocation Panel', desc: 'View and bulk-revoke all refresh tokens for any user across all devices simultaneously.', tag: 'v2 — requires service role key' },
            ].map(({ icon: Icon, title, desc, tag }) => (
              <Card key={title} className="bg-slate-800 border-slate-700 opacity-60">
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className="p-2 bg-slate-700 rounded-lg mt-0.5">
                    <Icon className="h-4 w-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{title}</p>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
                    <Badge className="mt-2 bg-slate-700 text-slate-400 border-slate-600 text-xxxs">{tag}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Force Password Reset Confirmation */}
      <Dialog open={!!pwResetTarget} onOpenChange={open => { if (!open) setPwResetTarget(null); }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-amber-400" /> Force Password Reset
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This will immediately send a password reset email to <strong className="text-white">{pwResetTarget?.email}</strong>.
              The user will receive a secure reset link valid for 1 hour.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-amber-500/30 bg-amber-500/10">
            <Mail className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300 text-xs">
              An audit log entry will be written with action <code>SUPER_ADMIN_FORCED_PASSWORD_RESET</code>.
            </AlertDescription>
          </Alert>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setPwResetTarget(null)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleForcePasswordReset} disabled={pwResetLoading}>
              {pwResetLoading ? 'Sending…' : 'Send Reset Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
