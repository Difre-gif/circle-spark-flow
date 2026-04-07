import { useState, useMemo } from 'react';
import { Loader2, Download, Calendar, ChevronRight, BarChart2, Activity, Home, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOccupancySummary, useOverdueAgingReport, useCollectionSummary, formatRWF } from '@/hooks/useSupabaseData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Generate last 12 months as filter options
function getMonthOptions() {
  const opts = [{ value: 'all', label: 'All Time' }];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    opts.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    });
  }
  return opts;
}

export default function Reports() {
  const [monthFilter, setMonthFilter] = useState('all');
  const { data: occupancy, isLoading: occLoading } = useOccupancySummary();
  const { data: aging, isLoading: agingLoading } = useOverdueAgingReport();
  const { data: collection, isLoading: colLoading } = useCollectionSummary();

  const isLoading = occLoading || agingLoading || colLoading;

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Group aging by bucket
  const agingBuckets = (() => {
    if (!aging || aging.length === 0) return [];
    const bucketMap: Record<string, { count: number; amount: number }> = {};
    aging.forEach(r => {
      const bucket = r.aging_bucket ?? 'Unknown';
      if (!bucketMap[bucket]) bucketMap[bucket] = { count: 0, amount: 0 };
      bucketMap[bucket].count++;
      bucketMap[bucket].amount += Number(r.amount_overdue ?? 0);
    });
    return Object.entries(bucketMap).map(([bucket, data]) => ({ bucket, ...data }));
  })();

  // Collection chart data — filtered by selected month
  const collectionData = (collection ?? [])
    .filter(c => monthFilter === 'all' || (c.period ?? '').startsWith(monthFilter))
    .map(c => ({
      month: new Date(c.period ?? '').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
      collected: Number(c.total_amount_paid ?? 0),
      outstanding: Number(c.total_outstanding ?? 0),
    }));

  const monthOptions = getMonthOptions();

  const kpis = {
    totalCollected: collectionData.reduce((acc, curr) => acc + curr.collected, 0),
    totalOutstanding: collectionData.reduce((acc, curr) => acc + curr.outstanding, 0),
    avgOccupancy: occupancy && occupancy.length > 0 
      ? Math.round(occupancy.reduce((acc, curr) => acc + (curr.occupancy_rate_pct ?? 0), 0) / occupancy.length) 
      : 0
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy transition-colors">Analytics</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">Reports</span>
          </p>
          <h1 className="page-title text-2xl font-bold">Reports</h1>
          <p className="page-description text-muted-foreground mt-1">Financial and occupancy analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[180px] h-9 rounded-xl text-sm">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="rounded-xl font-semibold" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        <StatCard title="Total Collected (6mo)" value={formatRWF(kpis.totalCollected)} icon={BarChart2} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white" />
        <StatCard title="Total Outstanding" value={formatRWF(kpis.totalOutstanding)} icon={Activity} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white" />
        <StatCard title="Avg Portfolio Occupancy" value={`${kpis.avgOccupancy}%`} icon={Home} className="rounded-2xl border-0 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] bg-white" />
      </div>

      <Tabs defaultValue="collections" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border/40 w-full justify-start h-auto p-0 rounded-none overflow-x-auto flex-nowrap">
          <TabsTrigger 
            value="collections" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-bizrent-blue data-[state=active]:text-bizrent-blue data-[state=active]:bg-transparent px-6 py-3 font-bold text-muted-foreground hover:text-bizrent-navy transition-all"
          >
            Collections
          </TabsTrigger>
          <TabsTrigger 
            value="aging" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-bizrent-blue data-[state=active]:text-bizrent-blue data-[state=active]:bg-transparent px-6 py-3 font-bold text-muted-foreground hover:text-bizrent-navy transition-all"
          >
            Aging Report
          </TabsTrigger>
          <TabsTrigger 
            value="occupancy" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-bizrent-blue data-[state=active]:text-bizrent-blue data-[state=active]:bg-transparent px-6 py-3 font-bold text-muted-foreground hover:text-bizrent-navy transition-all"
          >
            Occupancy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2">
          <Card>
            <CardHeader><CardTitle>Monthly Collections vs Outstanding</CardTitle></CardHeader>
            <CardContent>
              {collectionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={collectionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: number) => formatRWF(v)} />
                    <Bar dataKey="collected" fill="hsl(160, 84%, 39%)" name="Collected" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outstanding" fill="hsl(0, 79%, 50%)" name="Outstanding" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                  <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <BarChart2 className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-bold text-bizrent-navy text-lg">No collection data yet</p>
                  <p className="text-sm mt-2 text-muted-foreground font-medium max-w-sm mb-6">
                    Your collection data will appear here once tenants start making payments against their invoices.
                  </p>
                  <Button 
                    className="rounded-xl font-bold px-6 bg-bizrent-navy hover:bg-bizrent-navy/90 text-white shadow-lg shadow-bizrent-navy/10"
                    onClick={() => window.location.href = '/landlord/tenants'}
                  >
                    Invite your first tenant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2">
          <Card>
            <CardHeader><CardTitle>Aging Buckets</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="bg-primary/5"><TableHead>Bucket</TableHead><TableHead>Invoices</TableHead><TableHead>Total Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {agingBuckets.map(b => (
                    <TableRow key={b.bucket}>
                      <TableCell className="font-medium">{b.bucket}</TableCell>
                      <TableCell>{b.count}</TableCell>
                      <TableCell className="font-semibold">{formatRWF(b.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {agingBuckets.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Total Outstanding</TableCell>
                      <TableCell>{agingBuckets.reduce((a, b) => a + b.count, 0)}</TableCell>
                      <TableCell>{formatRWF(agingBuckets.reduce((a, b) => a + b.amount, 0))}</TableCell>
                    </TableRow>
                  )}
                  {agingBuckets.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No overdue invoices</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-2">
          <Card>
            <CardHeader><CardTitle>Property Occupancy</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="bg-primary/5"><TableHead>Property</TableHead><TableHead>Total Units</TableHead><TableHead>Occupied</TableHead><TableHead>Vacant</TableHead><TableHead>Rate</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(occupancy ?? []).map(p => (
                    <TableRow key={p.property_id}>
                      <TableCell className="font-medium">{p.property_name}</TableCell>
                      <TableCell>{p.total_units}</TableCell>
                      <TableCell>{p.occupied_units}</TableCell>
                      <TableCell>{p.vacant_units}</TableCell>
                      <TableCell className="font-semibold">{p.occupancy_rate_pct ?? 0}%</TableCell>
                    </TableRow>
                  ))}
                  {(!occupancy || occupancy.length === 0) && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No property data</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
