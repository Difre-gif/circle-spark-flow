import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoices, formatRWF, formatDate } from '@/hooks/useSupabaseData';

export default function Invoices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { data: invoices, isLoading } = useInvoices({ status: statusFilter });

  const filtered = (invoices ?? []).filter(inv => {
    const name = (inv.tenant as any)?.full_name ?? '';
    return name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64 rounded-full" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-description">Track and manage {invoices?.length ?? 0} billing records</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by tenant or invoice #..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 h-10 rounded-full bg-white border-border/50 shadow-sm focus-visible:ring-bizrent-navy/20" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 h-10 bg-white border-border/50 shadow-sm focus:ring-bizrent-navy/20">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DUE">Due</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="text-left px-6 py-4 whitespace-nowrap">Invoice #</th>
                  <th className="text-left px-6 py-4">Tenant</th>
                  <th className="text-left px-6 py-4">Unit</th>
                  <th className="text-left px-6 py-4 text-right">Amount</th>
                  <th className="text-left px-6 py-4 text-right">Balance</th>
                  <th className="text-left px-6 py-4 text-center">Status</th>
                  <th className="text-left px-6 py-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/10">
                {filtered.map(inv => (
                  <tr key={inv.id} className="cursor-pointer transition-colors hover:bg-muted/30 border-b border-border/20" onClick={() => navigate(`/landlord/invoices/${inv.id}`)}>
                    <td className="px-6 py-4 font-bold text-bizrent-navy">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-bizrent-blue/70" />
                        {inv.invoice_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-bizrent-navy">{(inv.tenant as any)?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{(inv.unit as any)?.unit_number ?? '—'}</td>
                    <td className="px-6 py-4 text-right font-medium text-muted-foreground font-tabular-nums">{formatRWF(inv.amount_due)}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-bizrent-navy font-tabular-nums">{formatRWF(Number(inv.balance ?? (inv.amount_due - inv.amount_paid)))}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={inv.status} /></td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{formatDate(inv.due_date)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 mb-2 opacity-20" />
                        <p className="font-medium text-bizrent-navy">No invoices found</p>
                        <p className="text-sm mt-1">Try adjusting your search filters.</p>
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