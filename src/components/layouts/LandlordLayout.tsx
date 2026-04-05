import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { LandlordSidebar } from './LandlordSidebar';
import { TopBar } from './TopBar';
import { useSubscription } from '@/hooks/useSupabaseData';
import { AlertTriangle } from 'lucide-react';

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
    <div className="flex items-center gap-2 bg-bizrent-amber/15 border-b border-bizrent-amber/30 px-4 py-2 text-sm text-bizrent-amber">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function LandlordLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LandlordSidebar />
        <div className="flex-1 flex flex-col">
          <SubscriptionBanner />
          <TopBar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
