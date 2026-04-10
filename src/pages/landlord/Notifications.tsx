import { useNavigate } from 'react-router-dom';
import { Loader2, Bell, CreditCard, FileText, Users, Settings, Filter, CheckCheck, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-bizrent-navy" /></div>;

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
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-1">
            <span className="cursor-pointer hover:text-bizrent-navy transition-colors">System</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-bizrent-blue">Updates</span>
          </p>
          <h1 className="page-title text-3xl font-extrabold text-bizrent-navy tracking-tight">Notifications</h1>
          <p className="page-description font-medium text-muted-foreground">You have {unreadCount} unread alerts requiring your attention</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-border/60 font-semibold h-11">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button 
            className="bg-bizrent-navy hover:bg-bizrent-navy/90 text-white rounded-xl font-semibold h-11 px-6 shadow-sm shadow-bizrent-navy/10 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => markAllRead.mutate()} 
            disabled={markAllRead.isPending || unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {(notifications ?? []).map(n => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <Card 
              key={n.id} 
              className={cn(
                'group border-0 rounded-[2rem] shadow-sm transition-all hover:shadow-md hover:translate-x-1 cursor-pointer overflow-hidden',
                !n.is_read ? 'bg-white ring-1 ring-bizrent-blue/20' : 'bg-muted/30 opacity-80'
              )} 
              onClick={() => handleClick(n)}
            >
              <CardContent className="p-6 flex items-center gap-6 relative">
                {!n.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-bizrent-blue" />
                )}
                
                <div className={cn(
                  'rounded-2xl p-3 shrink-0 transition-all group-hover:scale-110', 
                  !n.is_read ? 'bg-bizrent-blue/10 text-bizrent-blue' : 'bg-slate-200 text-slate-500'
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className={cn('text-base tracking-tight leading-tight', !n.is_read ? 'font-extrabold text-bizrent-navy' : 'font-bold text-muted-foreground')}>
                      {n.title}
                    </p>
                    <span className="text-xxs font-bold text-muted-foreground/60 whitespace-nowrap pt-1">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground line-clamp-1 group-hover:line-clamp-none transition-all">
                    {n.body}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xxs font-extrabold text-bizrent-slate uppercase tracking-tighter">
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <div className="h-2.5 w-2.5 rounded-full bg-bizrent-blue shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                )}
              </CardContent>
            </Card>
          );
        })}
        {(!notifications || notifications.length === 0) && (
          <div className="py-24 text-center border-2 border-dashed border-muted rounded-[3rem] bg-muted/5">
            <div className="flex flex-col items-center justify-center">
              <Bell className="h-12 w-12 mb-4 text-muted-foreground/20" />
              <p className="text-xl font-extrabold text-bizrent-navy">All caught up!</p>
              <p className="text-sm font-medium text-muted-foreground mt-1">No new notifications at this time.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
