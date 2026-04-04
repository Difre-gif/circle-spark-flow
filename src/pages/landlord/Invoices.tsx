import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">{invoices?.length ?? 0} total invoices</p>
      </div>
      <div className="flex gap-4 flex-wrap">
        <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DUE">Due</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Invoice #</TableHead><TableHead>Tenant</TableHead><TableHead>Unit</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(inv => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/landlord/invoices/${inv.id}`)}>
                  <TableCell className="font-medium text-primary">{inv.invoice_number}</TableCell>
                  <TableCell>{(inv.tenant as any)?.full_name ?? '—'}</TableCell>
                  <TableCell>{(inv.unit as any)?.unit_number ?? '—'}</TableCell>
                  <TableCell>{formatRWF(inv.amount_due)}</TableCell>
                  <TableCell>{formatRWF(inv.amount_paid)}</TableCell>
                  <TableCell className="font-medium">{formatRWF(Number(inv.balance ?? (inv.amount_due - inv.amount_paid)))}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(inv.due_date)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No invoices found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
