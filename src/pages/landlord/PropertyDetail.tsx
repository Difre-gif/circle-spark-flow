import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useProperty, useUnits, formatRWF } from '@/hooks/useSupabaseData';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading: propLoading } = useProperty(id);
  const { data: units, isLoading: unitsLoading } = useUnits(id);

  if (propLoading || unitsLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!property) return <div className="text-center py-12 text-muted-foreground">Property not found</div>;

  const occupiedCount = units?.filter(u => u.status === 'OCCUPIED').length ?? 0;
  const totalCount = units?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/landlord/properties')}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground">{property.address_line1}, {property.district}, {property.city}</p>
        </div>
        <StatusBadge status={property.is_active ? 'ACTIVE' : 'INACTIVE'} />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Type</p><p className="text-lg font-semibold">{property.property_type}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Units</p><p className="text-lg font-semibold">{occupiedCount}/{totalCount}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Occupancy</p><p className="text-lg font-semibold">{totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Units</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/5">
                <TableHead>Unit #</TableHead><TableHead>Type</TableHead><TableHead>Monthly Rent</TableHead><TableHead>Status</TableHead><TableHead>Floor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(units ?? []).map(u => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.unit_number}</TableCell>
                  <TableCell>{u.unit_type}</TableCell>
                  <TableCell>{formatRWF(u.monthly_rent)}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{u.floor ?? '—'}</TableCell>
                </TableRow>
              ))}
              {(!units || units.length === 0) && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No units found for this property</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
