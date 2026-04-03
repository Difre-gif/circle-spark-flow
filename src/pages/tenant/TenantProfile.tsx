import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { mockTenantUser } from '@/data/mockData';

export default function TenantProfile() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Profile</h1><p className="text-muted-foreground">Manage your personal information</p></div>

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Full Name</Label><Input defaultValue={mockTenantUser.name} /></div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue={mockTenantUser.email} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input defaultValue={mockTenantUser.phone} /></div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Invoice Reminders</p><p className="text-sm text-muted-foreground">Get reminded before due dates</p></div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Payment Status</p><p className="text-sm text-muted-foreground">Updates when payments are approved/rejected</p></div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium">SMS Notifications</p><p className="text-sm text-muted-foreground">Receive alerts via SMS</p></div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
