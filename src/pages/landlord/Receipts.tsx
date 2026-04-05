import { useState } from 'react';
import { Loader2, Download, Search, FileCheck, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReceipts, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { StatusBadge } from '@/components/StatusBadge';

export default function Receipts() {
  const [search, setSearch] = useState('');
  const { data: receipts, isLoading } = useReceipts();

  const filtered = (receipts ?? []).filter(r => 
    r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
    ((r.tenant as any)?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    ((r.invoice as any)?.invoice_number ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-bizrent-blue uppercase tracking-widest mb-1">Collections / Receipts</p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy tracking-tight">Receipts</h1>
          <p className="page-description font-medium text-muted-foreground">View and download {receipts?.length ?? 0} generated payment receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-border/60 font-semibold h-11">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-semibold h-11 px-6 shadow-sm transition-all hover:scale-[1.02]">
            <Download className="mr-2 h-4 w-4" /> Export All
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-bizrent-blue" />
        <Input 
          placeholder="Search by receipt, tenant or invoice..." 
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
                  <th className="text-left px-8 py-4 whitespace-nowrap">Receipt #</th>
                  <th className="text-left px-4 py-4">Linked Invoice</th>
                  <th className="text-left px-4 py-4">Tenant</th>
                  <th className="text-left px-4 py-4 text-right">Amount</th>
                  <th className="text-left px-4 py-4 text-center">Status</th>
                  <th className="text-left px-8 py-4 text-right">Generated At</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/5">
                {filtered.map(r => (
                  <tr key={r.id} className="transition-all hover:bg-muted/10 border-b border-border/10 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bizrent-emerald/10 rounded-lg group-hover:scale-110 transition-transform">
                          <FileCheck className="h-4 w-4 text-bizrent-emerald" />
                        </div>
                        <span className="font-extrabold text-bizrent-navy">{r.receipt_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-bold text-bizrent-blue">
                      {(r.invoice as any)?.invoice_number ?? '—'}
                    </td>
                    <td className="px-4 py-5 font-semibold text-bizrent-navy">
                      {(r.tenant as any)?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-5 text-right font-extrabold text-bizrent-navy font-tabular-nums">
                      {formatRWF((r.invoice as any)?.amount_paid ?? 0)}
                    </td>
                    <td className="px-4 py-5 text-center">
                      <StatusBadge status="PAID" />
                    </td>
                    <td className="px-8 py-5 text-right text-muted-foreground text-xs font-bold whitespace-nowrap">
                      {formatDate(r.generated_at)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-bizrent-navy hover:text-white transition-colors">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <FileCheck className="h-10 w-10 mb-2 opacity-10" />
                        <p className="font-bold text-bizrent-navy">No receipts found</p>
                        <p className="text-xs font-medium mt-1">Try adjusting your filters or search terms.</p>
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
