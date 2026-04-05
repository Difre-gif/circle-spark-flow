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
  Filter, 
  Loader2,
  ShieldCheck,
  User,
  Building,
  ArrowRight
} from "lucide-react";

export default function SuperAdminAuditLogs() {
  const { data: logs, isLoading } = useGlobalAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs?.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.org?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-200';
    if (action.includes('CREATE') || action.includes('INSERT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('LOGIN')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Audit Trail</h1>
        <p className="text-slate-500 font-medium italic">Immutable ledger of platform-wide activity and security events.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by action, user, or organization..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-900">{log.actor?.full_name || "System"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-slate-400" />
                        <span className="text-slate-600">{log.org?.name || "Global"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getActionColor(log.action)} font-mono text-[10px]`}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{log.target_type}</span>
                        <ArrowRight size={10} />
                        <span className="truncate max-w-[120px]">{log.target_id}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
