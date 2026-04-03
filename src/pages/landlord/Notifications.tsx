import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockNotifications, formatDate } from '@/data/mockData';
import { Bell, CreditCard, FileText, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  payment: CreditCard,
  invoice: FileText,
  tenant: Users,
  system: Settings,
};

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground">{mockNotifications.filter(n => !n.read).length} unread</p></div>
        <Button variant="outline">Mark all as read</Button>
      </div>

      <div className="space-y-3">
        {mockNotifications.map(n => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <Card key={n.id} className={cn(!n.read && 'border-l-4 border-l-primary')}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn('rounded-lg p-2', n.read ? 'bg-muted' : 'bg-primary/10')}>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
