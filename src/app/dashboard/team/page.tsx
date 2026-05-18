import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { UserFormModal } from "@/components/team/user-form-modal";
import { TeamTable } from "@/components/team/team-table";
import {
  Users,
  Shield,
  Sparkles,
  Mail,
  Building2,
  UserCircle,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Suspense } from "react";
import { OrdersTableSkeleton } from "@/components/ui/skeleton";

export default async function DashboardTeamPage() {
  return (
    <div className="max-w-400 mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion de l'Ã‰quipe
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            GÃ©rez les accÃ¨s, les rÃ´les et les performances de votre personnel.
          </p>
        </div>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <TeamContent />
      </Suspense>
    </div>
  );
}

async function TeamContent() {
  const supabase = await createClient();

  // Enforce role-based access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-16 w-16 rounded-4xl bg-rose-500/10 flex items-center justify-center text-rose-600">
          <Shield className="h-8 w-8" />
        </div>
        <p className="text-xl font-black tracking-tighter italic">
          PÃ©rimÃ¨tre Administrateur
        </p>
        <p className="text-sm text-muted-foreground font-medium">
          L&apos;accÃ¨s Ã  la gestion du personnel est restreint.
        </p>
      </div>
    );
  }

  // Fetch Boutiques
  const { data: boutiques } = await supabase
    .from("boutiques")
    .select("*")
    .order("name");

  // Fetch Team
  const { data: members, error } = await supabase
    .from("users")
    .select(`
      *,
      boutique:boutiques(name)
    `)
    .neq("role", "client")
    .order("name");

  if (error) {
    console.error("Error fetching team:", error);
    return <div>Erreur lors du chargement de l'Ã©quipe.</div>;
  }

  // Calculate quick stats
  const stats = {
    total: members?.length || 0,
    admins: members?.filter(m => m.role === 'admin').length || 0,
    managers: members?.filter(m => m.role === 'manager').length || 0,
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Ã‰quipe", value: stats.total, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Administrateurs", value: stats.admins, icon: UserCheck, color: "text-indigo-600 bg-indigo-50" },
          { label: "Managers", value: stats.managers, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <TeamTable members={members || []} />
    </div>
  );
}
