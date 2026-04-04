import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CreditCard, FileText, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, formatDate } from '@/hooks/useSupabaseData';

const iconMap: Record<string, React.ElementType> = {
  PAYMENT_SUBMITTED: CreditCard,
  PAYMENT_APPROVED: CreditCard,
  PAYMENT_REJECTED: CreditCard,
  INVOICE_DUE: FileText,
  INVOICE_OVERDUE: FileText,
  RECEIPT_AVAILABLE: FileText,
  SUBSCRIPTION_EXPIRING: Settings,
};

export default function Notifications() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length;

  const handleClick = (n: any) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.reference_id && n.reference_type) {
      const typeMap: Record<string, string> = {
        payment: '/landlord/payments/',
        invoice: '/landlord/invoices/',
        tenancy: '/landlord/tenancies',
      };
      const prefix = typeMap[n.reference_type] ?? '';
      if (prefix) navigate(`${prefix}${n.reference_id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground">{unreadCount} unread</p></div>
        <Button variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>Mark all as read</Button>
      </div>

      <div className="space-y-3">
        {(notifications ?? []).map(n => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <Card key={n.id} className={cn(!n.is_read && 'border-l-4 border-l-primary', 'cursor-pointer')} onClick={() => handleClick(n)}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={cn('rounded-lg p-2', n.is_read ? 'bg-muted' : 'bg-primary/10')}>
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !n.is_read && 'font-semibold')}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />}
              </CardContent>
            </Card>
          );
        })}
        {(!notifications || notifications.length === 0) && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No notifications</CardContent></Card>
        )}
      </div>
    </div>
  );
}
