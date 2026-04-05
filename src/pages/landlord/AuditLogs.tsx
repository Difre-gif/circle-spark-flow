import { useState } from 'react';
import { Loader2, ShieldCheck, Search, Filter, History, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuditLogs, formatDate } from '@/hooks/useSupabaseData';
import { Badge } from '@/components/ui/badge';

export default function AuditLogs() {
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');

  const filtered = (logs ?? []).filter(l =>
    ((l.actor as any)?.full_name ?? 'System').toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target_type.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest mb-1">System / Compliance</p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy tracking-tight">Audit Logs</h1>
          <p className="page-description font-medium text-muted-foreground">Detailed activity trail for security and governance</p>
        </div>
        <Button variant="outline" className="rounded-xl border-border/60 font-semibold h-11">
          <Filter className="mr-2 h-4 w-4" /> Filter Logs
        </Button>
      </div>

      <div className="relative max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-bizrent-blue" />
        <Input 
          placeholder="Filter by action or actor..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-11 h-11 rounded-xl bg-white border-border/50 shadow-sm focus-visible:ring-bizrent-navy/20 text-sm font-medium" 
        />
      </div>

      <Card className="overflow-hidden border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20 bg-muted/20 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                  <th className="text-left px-8 py-4">Event Type</th>
                  <th className="text-left px-4 py-4">Actor</th>
                  <th className="text-left px-4 py-4">Target Type</th>
                  <th className="text-left px-4 py-4">Target ID</th>
                  <th className="text-left px-8 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/5">
                {filtered.map(l => (
                  <tr key={l.id} className="transition-all hover:bg-muted/10 border-b border-border/10 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bizrent-navy/5 rounded-lg text-bizrent-navy border border-bizrent-navy/10">
                          <History className="h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className="px-3 font-mono text-[10px] font-bold bg-muted/80 text-bizrent-navy border-0">
                          {l.action}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-3 w-3 text-slate-500" />
                        </div>
                        <span className="font-extrabold text-bizrent-navy">{(l.actor as any)?.full_name ?? 'System'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-muted-foreground font-semibold text-xs tracking-wide">
                      {l.target_type}
                    </td>
                    <td className="px-4 py-5">
                      <code className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono text-bizrent-slate">
                        {(l.target_id as string)?.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-muted-foreground text-xs font-tabular-nums">
                      {new Date(l.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <ShieldCheck className="h-10 w-10 mb-2 opacity-10" />
                        <p className="font-bold text-bizrent-navy">Clean activity trail</p>
                        <p className="text-xs font-medium mt-1">No logs found for your current filters.</p>
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
