import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { mockProperties, mockUnits, formatRWF } from '@/data/mockData';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = mockProperties.find(p => p.id === id);
  const units = mockUnits.filter(u => u.propertyId === id);

  if (!property) return <div className="text-center py-12 text-muted-foreground">Property not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/landlord/properties')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground">{property.address}, {property.district}, {property.city}</p>
        </div>
        <StatusBadge status={property.status} />
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Type</p><p className="text-lg font-semibold">{property.type}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Units</p><p className="text-lg font-semibold">{property.occupiedUnits}/{property.totalUnits}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Occupancy</p><p className="text-lg font-semibold">{Math.round((property.occupiedUnits / property.totalUnits) * 100)}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Units</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Unit #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tenant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.unitNumber}</TableCell>
                  <TableCell>{u.type}</TableCell>
                  <TableCell>{formatRWF(u.monthlyRent)}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{u.tenantName || '—'}</TableCell>
                </TableRow>
              ))}
              {units.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No units found for this property</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
