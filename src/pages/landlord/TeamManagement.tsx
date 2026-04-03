import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { mockTeamMembers, formatDate } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TeamManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Team Management</h1><p className="text-muted-foreground">Manage your organisation's team members and roles</p></div>
        <Button onClick={() => setDialogOpen(true)}><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTeamMembers.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell><StatusBadge status={m.role} /></TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(m.joinedAt)}</TableCell>
                </TableRow>
              ))}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="team@example.com" /></div>
            <div className="space-y-2"><Label>Role</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent><SelectItem value="MANAGER">Manager</SelectItem><SelectItem value="ACCOUNTANT">Accountant</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setDialogOpen(false)}>Send Invitation</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
