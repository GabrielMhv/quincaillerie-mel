import { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Suspense fallback={<div className="w-[240px] hidden md:block bg-card border-r" />}>
        <DashboardSidebar />
      </Suspense>
      <div className="flex flex-col flex-1 w-full overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <Suspense fallback={<div className="h-14 border-b bg-card" />}>
          <DashboardTopbar />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 lg:pb-24 h-[calc(100vh-60px)] custom-scrollbar">
          <div className="max-w-[1600px] mx-auto animate-in fade-in duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
