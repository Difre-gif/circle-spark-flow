import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useTeamMembers, formatDate } from '@/hooks/useSupabaseData';

export default function TeamManagement() {
  const { data: members, isLoading } = useTeamMembers();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">Manage your organisation's team members and roles</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(members ?? []).map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{(m.user as any)?.full_name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{(m.user as any)?.email ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={m.role} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(m.created_at)}</TableCell>
                </TableRow>
              ))}
              {(!members || members.length === 0) && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No team members</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Role Permissions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div><span className="font-semibold text-primary">Owner</span> — Full access: manage properties, units, tenants, invoices, payments, team, settings</div>
            <div><span className="font-semibold text-bizrent-blue">Manager</span> — Manage properties, units, tenants, invoices, and approve/reject payments</div>
            <div><span className="font-semibold text-bizrent-forest">Accountant</span> — View-only properties; manage invoices, payments, receipts, and reports</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
