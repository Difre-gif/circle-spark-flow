import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { SuperAdminSidebar } from "./SuperAdminSidebar";

export function SuperAdminLayout() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
      <SuperAdminSidebar />
      <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
