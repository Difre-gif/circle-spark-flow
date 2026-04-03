import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/StatusBadge';
import { mockOrganisation } from '@/data/mockData';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your organisation and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Organisation Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Organisation Name</Label><Input defaultValue={mockOrganisation.name} /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue={mockOrganisation.email} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input defaultValue={mockOrganisation.phone} /></div>
            <div className="space-y-2"><Label>Address</Label><Input defaultValue={mockOrganisation.address} /></div>
            <div className="space-y-2"><Label>City</Label><Input defaultValue={mockOrganisation.city} /></div>
            <div className="space-y-2"><Label>Country</Label><Input defaultValue={mockOrganisation.country} /></div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Plan</span>
            <StatusBadge status="ACTIVE" className="text-sm" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tier</span>
            <span className="font-bold text-lg">{mockOrganisation.subscriptionTier}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Properties Allowed</span>
            <span>Unlimited</span>
          </div>
          <Button variant="outline" className="mt-4">Upgrade Plan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Payment Submissions</p><p className="text-sm text-muted-foreground">Get notified when tenants submit payments</p></div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Overdue Invoices</p><p className="text-sm text-muted-foreground">Alert when invoices become overdue</p></div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="font-medium">SMS Notifications</p><p className="text-sm text-muted-foreground">Receive important alerts via SMS</p></div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
