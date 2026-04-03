import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { LandlordSidebar } from './LandlordSidebar';
import { TopBar } from './TopBar';

export function LandlordLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LandlordSidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
