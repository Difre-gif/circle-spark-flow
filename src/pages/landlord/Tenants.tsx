import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest">Management / Tenants</p>
          <h1 className="page-title">Tenants</h1>
          <p className="page-description">View {tenants?.length ?? 0} active tenants</p>
        </div>
      </div>
      
      <div className="flex items-center max-w-sm relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-11 h-11 rounded-full bg-white border-border/50 shadow-sm focus-visible:ring-bizrent-navy/20 text-sm font-medium" 
        />
      </div>

      <Card className="overflow-hidden border-0 rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="text-left px-6 py-4 whitespace-nowrap">Name</th>
                  <th className="text-left px-6 py-4">Email</th>
                  <th className="text-left px-6 py-4">Phone</th>
                  <th className="text-left px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/10">
                {filtered.map(t => {
                  const user = t.user as any;
                  return (
                    <tr key={t.user_id} className="transition-colors hover:bg-muted/30 border-b border-border/20">
                      <td className="px-6 py-4 font-bold text-bizrent-navy">{user?.full_name ?? '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">{user?.email ?? '—'}</td>
                      <td className="px-6 py-4 font-medium text-bizrent-slate">{user?.phone ?? '—'}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-semibold">{formatDate(t.created_at)}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <p className="font-medium text-bizrent-navy">No tenants found</p>
                        <p className="text-sm mt-1">Try adjusting your search criteria.</p>
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
  );
}