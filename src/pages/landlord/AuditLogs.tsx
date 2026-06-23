import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Loader2, ShieldCheck, Search, Filter, History, User, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuditLogs, formatDate } from '@/hooks/useSupabaseData';
import { Badge } from '@/components/ui/badge';

export default function AuditLogs() {
  const { t } = useTranslation();
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');

  const filtered = (logs ?? []).filter(l =>
    ((l.actor as any)?.full_name ?? 'System').toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.target_type.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy dark:text-white" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy dark:text-white transition-colors">{t('legacy.system')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">{t('legacy.compliance')}</span>
          </p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy dark:text-white tracking-tight">{t('legacy.auditLogs')}</h1>
          <p className="page-description font-medium text-muted-foreground">{t('legacy.detailedActivityTrailForSecurityAndGovernance')}</p>
        </div>
        <Button variant="outline" className="rounded-xl border-border/60 font-semibold h-11">
          <Filter className="mr-2 h-4 w-4" /> {t('legacy.filterLogs')}
        </Button>
      </div>

      <div className="relative max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-bizrent-blue" />
        <Input 
          placeholder="Filter by action or actor..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-11 h-11 rounded-xl bg-card border-border/50 shadow-sm focus-visible:ring-bizrent-blue/20/20 text-sm font-medium" 
        />
      </div>

      <Card className="overflow-hidden border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card">
        <CardContent className="p-0">
          <div className="responsive-table-shell">
            <table className="responsive-data-table w-full text-sm">
              <thead>
                <tr className="border-b border-border/20 bg-muted/20 text-muted-foreground font-bold uppercase text-xxs tracking-widest">
                  <th className="text-left px-8 py-4">{t('legacy.eventType')}</th>
                  <th className="text-left px-4 py-4">{t('legacy.actor')}</th>
                  <th className="text-left px-4 py-4">{t('legacy.targetType')}</th>
                  <th className="text-left px-4 py-4">{t('legacy.targetId')}</th>
                  <th className="text-left px-8 py-4 text-right">{t('legacy.timestamp')}</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/40">
                {filtered.map(l => (
                  <tr key={l.id} className="transition-all hover:bg-card border-b border-border/10 group">
                    <td data-label={t('legacy.eventType')} className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bizrent-navy/5 rounded-lg text-bizrent-navy dark:text-white border border-bizrent-navy/10">
                          <History className="h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className="px-3 font-mono text-xxs font-bold bg-muted/80 text-bizrent-navy dark:text-white border-0">
                          {l.action}
                        </Badge>
                      </div>
                    </td>
                    <td data-label={t('legacy.actor')} className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="font-extrabold text-bizrent-navy dark:text-white">{(l.actor as any)?.full_name ?? 'System'}</span>
                      </div>
                    </td>
                    <td data-label={t('legacy.targetType')} className="px-4 py-5 text-muted-foreground font-semibold text-xs tracking-wide">
                      {l.target_type}
                    </td>
                    <td data-label={t('legacy.targetId')} className="px-4 py-5">
                      <code className="text-xxs bg-muted px-2 py-1 rounded font-mono text-bizrent-slate">
                        {(l.target_id as string)?.substring(0, 8)}...
                      </code>
                    </td>
                    <td data-label={t('legacy.timestamp')} className="px-8 py-5 text-right font-bold text-muted-foreground text-xs font-mono">
                      {new Date(l.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <ShieldCheck className="h-10 w-10 mb-2 opacity-10" />
                        <p className="font-bold text-bizrent-navy dark:text-white">{t('legacy.cleanActivityTrail')}</p>
                        <p className="text-xs font-medium mt-1">{t('legacy.noLogsFoundForYourCurrentFilters')}</p>
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
