import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Loader2, Download, Search, FileCheck, Filter, CalendarIcon, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOrganisation, useReceipts, formatRWF, formatDate } from '@/hooks/useSupabaseData';
import { StatusBadge } from '@/components/StatusBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { downloadReceiptPdf } from '@/lib/receiptPdf';

export default function Receipts() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const { data: receipts, isLoading } = useReceipts();
  const { data: organisation } = useOrganisation();

  const filtered = (receipts ?? []).filter(r => {
    const matchesSearch = r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
                          ((r.tenant as any)?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                          ((r.invoice as any)?.invoice_number ?? '').toLowerCase().includes(search.toLowerCase());
    
    let matchesDate = true;
    if (dateRange) {
      const rDate = new Date(r.generated_at);
      matchesDate = rDate.getFullYear() === dateRange.getFullYear() &&
                    rDate.getMonth() === dateRange.getMonth() &&
                    rDate.getDate() === dateRange.getDate();
    }
    
    return matchesSearch && matchesDate;
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-bizrent-navy dark:text-white" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy dark:text-white transition-colors">{t('legacy.collections')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">{t('legacy.receipts')}</span>
          </p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy dark:text-white tracking-tight">{t('legacy.receipts')}</h1>
          <p className="page-description font-medium text-muted-foreground">View and download {receipts?.length ?? 0} generated payment receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("rounded-xl border-border/60 font-semibold h-11", dateRange && "bg-muted text-bizrent-navy dark:text-white")}>
                <CalendarIcon className="mr-2 h-4 w-4" /> 
                {dateRange ? format(dateRange, "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
              {dateRange && (
                <div className="p-3 border-t border-border/50">
                  <Button variant="ghost" className="w-full text-xs h-8" onClick={() => setDateRange(undefined)}>{t('legacy.clearFilter')}</Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-semibold h-11 px-6 shadow-sm transition-all hover:scale-[1.02]">
                <Download className="mr-2 h-4 w-4" /> {t('legacy.exportAll')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-lg border-border/40">
              <DropdownMenuItem className="cursor-pointer py-2 px-3 font-medium rounded-lg hover:bg-muted/40 transition-colors">
                {t('legacy.exportAsCsv')}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 px-3 font-medium rounded-lg hover:bg-muted/40 transition-colors">
                {t('legacy.exportAsPdf')}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 px-3 font-medium rounded-lg hover:bg-muted/40 transition-colors">
                {t('legacy.exportAsExcel')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="relative max-w-sm group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-bizrent-blue" />
        <Input 
          placeholder="Search by receipt, tenant or invoice..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="pl-11 h-11 rounded-xl bg-card border-border/50 shadow-sm focus-visible:ring-bizrent-blue/20 text-sm font-medium" 
        />
      </div>

      <Card className="overflow-hidden border-0 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-card">
        <CardContent className="p-0">
          <div className="responsive-table-shell">
            <table className="responsive-data-table w-full text-sm">
              <thead>
                <tr className="border-b border-border/20 bg-muted/20 text-muted-foreground font-bold uppercase text-xxs tracking-widest">
                  <th className="text-left px-8 py-4 whitespace-nowrap">{t('legacy.receiptNumber')}</th>
                  <th className="text-left px-4 py-4">{t('legacy.linkedInvoice')}</th>
                  <th className="text-left px-4 py-4">{t('legacy.tenant')}</th>
                  <th className="text-left px-4 py-4 text-right">{t('legacy.amount')}</th>
                  <th className="text-left px-4 py-4 text-center">{t('legacy.status')}</th>
                  <th className="text-left px-8 py-4 text-right">{t('legacy.generatedAt')}</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-muted/40">
                {filtered.map(r => (
                  <tr key={r.id} className="transition-all hover:bg-card border-b border-border/10 group">
                    <td data-label={t('legacy.receiptNumber')} className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-bizrent-emerald/10 rounded-lg group-hover:scale-110 transition-transform">
                          <FileCheck className="h-4 w-4 text-bizrent-emerald" />
                        </div>
                        <span className="font-extrabold text-bizrent-navy dark:text-white">BR-2026-{r.receipt_number.split("-").pop()}</span>
                      </div>
                    </td>
                    <td data-label={t('legacy.linkedInvoice')} className="px-4 py-5 font-bold text-bizrent-blue">
                      {(r.invoice as any)?.invoice_number ?? '—'}
                    </td>
                    <td data-label={t('legacy.tenant')} className="px-4 py-5 font-semibold text-bizrent-navy dark:text-white">
                      {(r.tenant as any)?.full_name ?? '—'}
                    </td>
                    <td data-label={t('legacy.amount')} className="px-4 py-5 text-right font-extrabold text-bizrent-navy dark:text-white font-mono">
                      {formatRWF((r.payment as any)?.amount ?? 0)}
                    </td>
                    <td data-label={t('legacy.status')} className="px-4 py-5 text-center">
                      <StatusBadge status="PAID" />
                    </td>
                    <td data-label={t('legacy.generatedAt')} className="px-8 py-5 text-right text-muted-foreground text-xs font-bold whitespace-nowrap">
                      {formatDate(r.generated_at)}
                    </td>
                    <td data-actions="true" className="px-8 py-5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-bizrent-navy hover:text-white transition-colors"
                        onClick={() => downloadReceiptPdf(r as any, organisation?.name)}
                      >
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
                        <p className="font-bold text-bizrent-navy dark:text-white">{t('legacy.noReceiptsFound')}</p>
                        <p className="text-xs font-medium mt-1">{t('legacy.tryAdjustingYourFiltersOrSearchTerms')}</p>
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
