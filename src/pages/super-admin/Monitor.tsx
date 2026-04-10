import { useState } from "react";
import { useFailedJobs, useRetryJob } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle, Radio, Zap } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function SuperAdminMonitor() {
  const { data: jobs, isLoading, refetch } = useFailedJobs();
  const retryJob = useRetryJob();
  const [retryingAll, setRetryingAll] = useState(false);

  const pendingJobs = jobs?.filter((j: any) => !j.resolved_at) ?? [];
  const resolvedJobs = jobs?.filter((j: any) => !!j.resolved_at) ?? [];

  const handleRetryAll = async () => {
    if (!pendingJobs.length) return;
    setRetryingAll(true);
    for (const job of pendingJobs) {
      await retryJob.mutateAsync(job.id);
    }
    setRetryingAll(false);
    toast.success(`${pendingJobs.length} jobs re-queued`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Radio className="text-red-500 animate-pulse" size={32} />
            Mission Control — Job Monitor
          </h1>
          <p className="text-slate-500 font-medium italic">Real-time visibility into failed platform background processes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} className="rounded-xl gap-2 font-bold text-xs uppercase tracking-widest h-11 px-6">
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button onClick={handleRetryAll} disabled={!pendingJobs.length || retryingAll} className="rounded-xl gap-2 font-bold text-xs uppercase tracking-widest h-11 px-6 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20">
            {retryingAll ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            Retry All ({pendingJobs.length})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Failed", value: jobs?.length ?? 0, color: "text-slate-900", icon: <AlertTriangle size={20} className="text-amber-500" /> },
          { label: "Pending Retry", value: pendingJobs.length, color: "text-red-600", icon: <Radio size={20} className="text-red-500 animate-pulse" /> },
          { label: "Resolved", value: resolvedJobs.length, color: "text-emerald-600", icon: <CheckCircle2 size={20} className="text-emerald-500" /> },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-md rounded-3xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xxs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              {stat.icon}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Jobs */}
      <Card className="border-none shadow-md rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50 p-8 pb-6">
          <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <div className="h-4 w-1 bg-red-500 rounded-full" />
            Pending Resolution
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium italic">Failed jobs awaiting admin retry or manual resolution.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-500" size={36} /></div>
          ) : pendingJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl"><CheckCircle2 size={40} /></div>
              <p className="font-bold text-slate-900 uppercase tracking-tight">All Clear</p>
              <p className="text-sm text-slate-400">No failed jobs in the queue.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-8 font-black uppercase text-xxxs tracking-[0.2em] text-slate-400 py-6">Job Type</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-slate-400 py-6">Error</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-slate-400 py-6">Attempts</TableHead>
                  <TableHead className="font-black uppercase text-xxxs tracking-[0.2em] text-slate-400 py-6">Age</TableHead>
                  <TableHead className="text-right px-8 font-black uppercase text-xxxs tracking-[0.2em] text-slate-400 py-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingJobs.map((job: any) => (
                  <TableRow key={job.id} className="hover:bg-red-50/30 transition-colors border-slate-50">
                    <TableCell className="px-8 py-5">
                      <Badge className="bg-red-100 text-red-700 border-none font-black uppercase text-xxxs tracking-widest rounded-lg">
                        {job.job_type || "NOTIFICATION"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs font-mono max-w-xs truncate">{job.error_message || "Unknown error"}</TableCell>
                    <TableCell className="text-slate-500 font-bold text-sm">{job.attempt_count ?? 0}</TableCell>
                    <TableCell className="text-slate-400 text-xs font-bold">
                      {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : "—"}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl font-bold text-xs h-9 px-4 border-red-200 text-red-600 hover:bg-red-50 active:scale-95 transition-all"
                        disabled={retryJob.isPending}
                        onClick={() => retryJob.mutate(job.id)}
                      >
                        {retryJob.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} className="mr-1" />}
                        Retry
                      </Button>
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
