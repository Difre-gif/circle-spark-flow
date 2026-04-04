import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useTenants, formatDate } from '@/hooks/useSupabaseData';

export default function Tenants() {
  const { data: tenants, isLoading } = useTenants();
  const [search, setSearch] = useState('');

  const filtered = (tenants ?? []).filter(t => {
    const user = t.user as any;
    return user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
           user?.email?.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tenants</h1>
        <p className="text-muted-foreground">{tenants?.length ?? 0} tenants</p>
      </div>
      <Input placeholder="Search tenants..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => {
                const user = t.user as any;
                return (
                  <TableRow key={t.user_id}>
                    <TableCell className="font-medium">{user?.full_name ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{user?.email ?? '—'}</TableCell>
                    <TableCell>{user?.phone ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(t.created_at)}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No tenants found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
