import { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useTeamMembers, formatDate } from '@/hooks/useSupabaseData';
import { InviteStaffModal } from '@/components/layouts/InviteStaffModal';

export default function TeamManagement() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { data: members, isLoading } = useTeamMembers();

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest">System / Users</p>
          <h1 className="page-title">Staff & Users</h1>
          <p className="page-description">Manage your organisation's team members and roles</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="bg-bizrent-navy hover:bg-bizrent-navy/90 gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Staff
        </Button>
      </div>

      <InviteStaffModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

      <Card className="overflow-hidden border-0 rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="text-left px-6 py-4 whitespace-nowrap">Name</th>
                  <th className="text-left px-6 py-4">Email</th>
                  <th className="text-left px-6 py-4">Role</th>
                  <th className="text-left px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/10">
                {(members ?? []).map(m => (
                  <tr key={m.id} className="transition-colors hover:bg-muted/30 border-b border-border/20">
                    <td className="px-6 py-4 font-bold text-bizrent-navy">{(m.user as any)?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{(m.user as any)?.email ?? '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={m.role} /></td>
                    <td className="px-6 py-4 text-muted-foreground text-xs font-semibold">{formatDate(m.created_at)}</td>
                  </tr>
                ))}
                {(!members || members.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-muted-foreground font-medium">
                      No team members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
        <CardHeader className="border-b border-border/40 pb-4 pt-6 px-6">
          <CardTitle className="text-base font-bold text-bizrent-navy">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pt-6 pb-6">
          <div className="space-y-5 text-sm">
            <div className="bg-muted/30 p-4 rounded-xl">
              <span className="font-bold text-bizrent-navy block mb-1">Owner</span>
              <span className="text-muted-foreground font-medium">Full access: manage properties, units, tenants, invoices, payments, team, settings.</span>
            </div>
            <div className="bg-muted/30 p-4 rounded-xl">
              <span className="font-bold text-bizrent-blue block mb-1">Manager</span>
              <span className="text-muted-foreground font-medium">Manage properties, units, tenants, invoices, and approve/reject payments.</span>
            </div>
            <div className="bg-muted/30 p-4 rounded-xl">
              <span className="font-bold text-bizrent-forest block mb-1">Accountant</span>
              <span className="text-muted-foreground font-medium">View-only properties; manage invoices, payments, receipts, and reports.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}