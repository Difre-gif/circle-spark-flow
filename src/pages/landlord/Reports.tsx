import { useState, useMemo } from 'react';
import { Loader2, Download, Calendar } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground">Financial and occupancy analytics</p></div>
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
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="collections">
        <TabsList>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4 mt-4">
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
                <p className="text-center py-12 text-muted-foreground">No collection data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-4 mt-4">
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

        <TabsContent value="occupancy" className="space-y-4 mt-4">
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
