import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

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
            className="pl-9 bg-white shadow-sm focus-visible:ring-bizrent-blue" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white shadow-sm focus:ring-bizrent-blue">
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

      <Card className="shadow-sm border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-bizrent-navy py-4">Invoice #</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Tenant</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Unit</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4 text-right">Amount</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4 text-right">Balance</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4 text-center">Status</TableHead>
                <TableHead className="font-semibold text-bizrent-navy py-4">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => navigate(`/landlord/invoices/${inv.id}`)}>
                  <TableCell className="font-bold text-bizrent-blue">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-bizrent-blue/70" />
                      {inv.invoice_number}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{(inv.tenant as any)?.full_name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{(inv.unit as any)?.unit_number ?? '—'}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatRWF(inv.amount_due)}</TableCell>
                  <TableCell className="text-right font-bold text-bizrent-navy">{formatRWF(Number(inv.balance ?? (inv.amount_due - inv.amount_paid)))}</TableCell>
                  <TableCell className="text-center"><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground font-medium">{formatDate(inv.due_date)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-10 w-10 mb-3 text-muted-foreground/50" />
                      <p className="text-lg font-medium text-bizrent-navy">No invoices found</p>
                      <p className="text-sm">Try adjusting your search filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}