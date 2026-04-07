import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ChevronRight, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
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
  const [sortField, setSortField] = useState<'due_date' | 'amount_due'>('due_date');
  const [sortAsc, setSortAsc] = useState(true);

  const { data: invoices, isLoading } = useInvoices({ status: statusFilter });

  const filtered = (invoices ?? [])
    .filter(inv => {
      const name = (inv.tenant as any)?.full_name ?? '';
      return name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === 'amount_due') return (a.amount_due - b.amount_due) * dir;
      return (new Date(a.due_date).getTime() - new Date(b.due_date).getTime()) * dir;
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
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header">
        <div>
          <p className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy transition-colors">Collections</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">Invoices</span>
          </p>
          <h1 className="page-title">Invoices</h1>
          <p className="page-description">Track and manage {invoices?.length ?? 0} billing records</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by tenant or invoice #..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-11 h-11 rounded-full bg-white border-border/50 shadow-sm focus-visible:ring-bizrent-navy/20 text-sm font-medium" 
          />
        </div>
        
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto overflow-x-auto">
          <TabsList className="h-11 bg-muted/50 rounded-full p-1 border border-border/40 w-max sm:w-auto flex-nowrap">
            <TabsTrigger value="ALL" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-bizrent-navy data-[state=active]:shadow-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="DUE" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-bizrent-navy data-[state=active]:shadow-sm">
              Due
            </TabsTrigger>
            <TabsTrigger value="OVERDUE" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-colors">
              Overdue
            </TabsTrigger>
            <TabsTrigger value="PARTIAL" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-colors">
              Partial
            </TabsTrigger>
            <TabsTrigger value="PAID" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-sm transition-colors">
              Paid
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden border-0 rounded-2xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20 text-muted-foreground font-semibold">
                  <th className="text-left px-6 py-4 whitespace-nowrap">Invoice #</th>
                  <th className="text-left px-6 py-4">Tenant</th>
                  <th className="text-left px-6 py-4">Unit</th>
                  <th 
                    className="text-left px-6 py-4 text-right cursor-pointer hover:bg-muted/40 transition-colors select-none"
                    onClick={() => { setSortField('amount_due'); setSortAsc(f => !f); }}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Amount
                      {sortField === 'amount_due' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-right">
                    Outstanding Balance
                    <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">(after partial payments)</span>
                  </th>
                  <th className="text-left px-6 py-4 text-center">Status</th>
                  <th 
                    className="text-left px-6 py-4 cursor-pointer hover:bg-muted/40 transition-colors select-none"
                    onClick={() => { setSortField('due_date'); setSortAsc(f => !f); }}
                  >
                    <div className="flex items-center gap-1">
                      Due Date
                      {sortField === 'due_date' && (sortAsc ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </th>
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
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        {search || statusFilter !== 'ALL' ? (
                          <>
                            <p className="font-bold text-bizrent-navy text-lg">No invoices match your filters</p>
                            <p className="text-sm mt-2 font-medium">Try clearing your search or changing the status filter.</p>
                            <Button 
                              variant="outline" 
                              className="mt-6 rounded-xl font-bold"
                              onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
                            >
                              Clear Filters
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-bizrent-navy text-lg">No invoices generated yet</p>
                            <p className="text-sm mt-2 font-medium px-4 text-center">
                              Invoices are generated automatically based on active tenancies, or you can create one manually.
                            </p>
                            <Button 
                              className="mt-6 bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-bold shadow-lg shadow-bizrent-navy/10 px-6 h-11"
                              onClick={() => navigate('/landlord/tenants')}
                            >
                              Add Tenants First <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </>
                        )}
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