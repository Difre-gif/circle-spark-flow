import { Outlet } from 'react-router-dom';
import { LandlordSidebar } from './LandlordSidebar';
import { TopBar } from './TopBar';
import { useSubscription, usePayments } from '@/hooks/useSupabaseData';
import { AlertTriangle, MessageCircleQuestion } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

function SubscriptionBanner() {
  const { data: subscription } = useSubscription();
  if (!subscription) return null;

  const status = subscription.status;
  if (status !== 'TRIAL' && status !== 'LAPSED') return null;

  let message = '';
  if (status === 'TRIAL' && subscription.trial_ends_at) {
    const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    message = `Trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining. Upgrade to keep your access.`;
  } else if (status === 'LAPSED') {
    message = 'Your subscription has lapsed. Some features are restricted.';
  }

  if (!message) return null;

  return (
    <div className="flex items-center gap-2 bg-bizrent-amber/15 border-b border-bizrent-amber/30 px-4 py-2 text-sm text-bizrent-amber font-medium z-50 relative">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function LandlordLayout() {
  const { data: payments } = usePayments({ status: 'PENDING' });
  const pendingCount = payments?.length ?? 0;

  useEffect(() => {
    if (pendingCount > 0) {
      document.title = `(${pendingCount}) BizRent | Management`;
    } else {
      document.title = `BizRent | Management`;
    }
  }, [pendingCount]);

  return (
    <SidebarProvider>
      <LandlordSidebar />
      <SidebarInset className="flex flex-col flex-1 w-full h-screen overflow-hidden bg-background font-sans relative">
        <SubscriptionBanner />
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar bg-background">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
        
        {/* Global Support Widget */}
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <Button 
            className="h-12 w-12 rounded-full shadow-2xl bg-bizrent-navy hover:bg-bizrent-navy/90 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            onClick={() => window.open('mailto:support@bizrent.com')}
          >
            <MessageCircleQuestion className="h-6 w-6" />
          </Button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
