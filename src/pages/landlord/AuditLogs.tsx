import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useAuditLogs } from '@/hooks/useSupabaseData';

export default function AuditLogs() {
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');

  const filtered = (logs ?? []).filter(l =>
    ((l.actor as any)?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target_type.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Complete activity trail for your organisation</p>
      </div>
      <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Timestamp</TableHead><TableHead>Actor</TableHead><TableHead>Action</TableHead><TableHead>Target Type</TableHead><TableHead>Target ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{(l.actor as any)?.full_name ?? 'System'}</TableCell>
                  <TableCell><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{l.action}</span></TableCell>
                  <TableCell>{l.target_type}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm font-mono">{l.target_id}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
