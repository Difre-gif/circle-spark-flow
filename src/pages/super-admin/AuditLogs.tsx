import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { useGlobalAuditLogs, formatDate } from "@/hooks/useSupabaseData";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  History, 
  Loader2,
  User,
  Building2,
  ShieldAlert,
  ArrowRight,
  Filter,
  Eye,
  FileText,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function SuperAdminAuditLogs() {
  const { t } = useTranslation();
  const { data: logs, isLoading } = useGlobalAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.org?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (actionFilter === "ALL") return matchesSearch;
    return matchesSearch && log.action === actionFilter;
  });

  const getActionColor = (action: string) => {
    if (action.includes("DELETE")) return "text-red-600 bg-red-50 border-red-100";
    if (action.includes("OVERRIDE") || action.includes("UPDATE")) return "text-amber-600 bg-amber-50 border-amber-100";
    if (action.includes("CREATE") || action.includes("APPROVE")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    return "text-muted-foreground bg-muted/40 border-border";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <History className="text-indigo-600" size={32} />
          {t('legacy.sovereignAuditTrail')}
        </h1>
        <p className="text-muted-foreground font-medium tracking-tight italic">{t('legacy.immutableRegistryOfAllMissionCriticalPlatformEventsAndAdministrativeOv')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by actor, organization, or action type..." 
            className="pl-12 h-12 rounded-2xl border-border shadow-sm focus-visible:ring-indigo-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px] h-12 rounded-2xl border-border font-bold text-xs uppercase tracking-widest text-muted-foreground">
            <SelectValue placeholder={t('legacy.eventType')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border p-2">
            <SelectItem value="ALL" className="rounded-lg font-bold">{t('legacy.allEvents')}</SelectItem>
            <SelectItem value="UPDATE_SUBSCRIPTION" className="rounded-lg font-bold text-amber-600">{t('legacy.subscriptionOverride')}</SelectItem>
            <SelectItem value="APPROVE_ORGANISATION" className="rounded-lg font-bold text-emerald-600">{t('legacy.orgApprovals')}</SelectItem>
            <SelectItem value="SUSPEND_USER" className="rounded-lg font-bold text-red-600">{t('legacy.identitySuspensions')}</SelectItem>
            <SelectItem value="IMPERSONATE" className="rounded-lg font-bold text-indigo-600">{t('legacy.adminImpersonation')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-none shadow-md overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">{t('legacy.syncingImmutableLedgers')}</p>
            </div>
          ) : !filteredLogs || filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
              <div className="p-5 bg-muted/40 text-slate-300 rounded-[2rem]">
                <Activity size={48} />
              </div>
              <div>
                <p className="font-black text-foreground uppercase tracking-tight text-xl">{t('legacy.noEventsRecorded')}</p>
                <p className="text-sm text-muted-foreground font-medium">{t('legacy.platformActivityLogsWillAppearHereAsTheyOccur')}</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-8 font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6 w-[250px]">{t('legacy.timestamp')}</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">Actor (Super Admin)</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.missionEvent')}</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.targetWorkspace')}</TableHead>
                  <TableHead className="text-right px-8 font-black uppercase text-xxxs tracking-[0.2em] text-muted-foreground py-6">{t('legacy.meta')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-bizrent-light transition-colors border-slate-50 group">
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground tracking-tight">{new Date(log.created_at).toLocaleDateString()}</span>
                        <span className="text-xxs text-muted-foreground font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <User size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-foreground truncate max-w-[120px]">{log.actor?.full_name || "System Process"}</span>
                          <span className="text-xxs text-muted-foreground font-bold uppercase tracking-tighter">ID: ...{log.actor_user_id?.slice(-6)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getActionColor(log.action)} border-none text-xxxs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg`}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.org ? (
                        <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-slate-300" />
                          <span className="text-xs font-bold text-foreground/80">{log.org.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 font-bold uppercase italic tracking-widest">{t('legacy.globalAction')}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 active:scale-90 transition-all">
                        <Eye size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <div className="p-6 bg-indigo-900 rounded-[2rem] text-white overflow-hidden relative group">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <ShieldAlert className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 rotate-12" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-200">{t('legacy.legalComplianceRegistry')}</h3>
          </div>
          <p className="text-xl font-bold max-w-2xl leading-relaxed">
            {t('legacy.thisAuditTrailIs')} <span className="text-indigo-300 italic underline decoration-indigo-400/50">{t('legacy.immutable')}</span>. All entries are hashed and stored with co-founder identity markers to ensure absolute platform governance.
          </p>
        </div>
      </div>
    </div>
  );
}