import { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <Suspense
        fallback={
          <div className="w-80 hidden lg:block bg-card/50 border-r border-primary/5 animate-pulse" />
        }
      >
        <DashboardSidebar />
      </Suspense>
      <div className="flex flex-col flex-1 w-full min-w-0 relative">
        {/* Modern dynamic background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />

        <Suspense
          fallback={
            <div className="h-20 w-full border-b border-primary/5 bg-background/50 backdrop-blur-xl animate-pulse" />
          }
        >
          <DashboardTopbar />
        </Suspense>

        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="p-4 sm:p-8 lg:p-12 pb-24 lg:pb-32 max-w-400 mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
