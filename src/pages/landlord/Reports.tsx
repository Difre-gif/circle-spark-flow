import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { mockInvoices, mockProperties, formatRWF } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const collectionData = [
  { month: 'Jan', collected: 2800000, outstanding: 400000 },
  { month: 'Feb', collected: 3100000, outstanding: 320000 },
  { month: 'Mar', collected: 2950000, outstanding: 500000 },
  { month: 'Apr', collected: 1700000, outstanding: 2170000 },
];

const agingBuckets = [
  { bucket: 'Current (0-5 days)', count: 1, amount: 350000, color: 'text-bizrent-blue' },
  { bucket: '6-15 days overdue', count: 1, amount: 200000, color: 'text-bizrent-amber' },
  { bucket: '16-30 days overdue', count: 1, amount: 420000, color: 'text-bizrent-overdue' },
  { bucket: '30+ days overdue', count: 1, amount: 1200000, color: 'text-bizrent-red' },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground">Financial and occupancy analytics</p></div>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
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
                      <TableCell className={`font-medium ${b.color}`}>{b.bucket}</TableCell>
                      <TableCell>{b.count}</TableCell>
                      <TableCell className="font-semibold">{formatRWF(b.amount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total Outstanding</TableCell>
                    <TableCell>{agingBuckets.reduce((a, b) => a + b.count, 0)}</TableCell>
                    <TableCell>{formatRWF(agingBuckets.reduce((a, b) => a + b.amount, 0))}</TableCell>
                  </TableRow>
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
                  {mockProperties.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.totalUnits}</TableCell>
                      <TableCell>{p.occupiedUnits}</TableCell>
                      <TableCell>{p.totalUnits - p.occupiedUnits}</TableCell>
                      <TableCell className="font-semibold">{Math.round((p.occupiedUnits / p.totalUnits) * 100)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
