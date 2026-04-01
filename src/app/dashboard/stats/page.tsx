import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Star,
  Trophy,
  TrendingUp,
  Zap,
  Target,
  Medal,
  Sparkles,
} from "lucide-react";

export default async function StatsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, boutique_id")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (role !== "admin" && role !== "manager") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-12 text-center bg-card/50 backdrop-blur-xl rounded-[4rem] border border-dashed border-primary/20">
        <Zap className="h-16 w-16 text-muted-foreground/20 mb-6" />
        <h2 className="text-3xl font-black tracking-tighter">
          Accès Restreint
        </h2>
        <p className="text-muted-foreground max-w-sm font-medium mt-2 leading-relaxed italic">
          Cette matrice de performance est réservée aux échelons de direction.
        </p>
      </div>
    );
  }

  const isGlobalScope = role === "admin" && !boutiqueSwitcherId;
  const filteredBoutiqueId = !isGlobalScope
    ? role === "admin"
      ? boutiqueSwitcherId
      : profile?.boutique_id
    : null;

  // 1. Fetch Orders with Employee Data
  let ordersQuery = supabase.from("orders").select(`
    *,
    employee:users!orders_employee_id_fkey(name, boutique_id),
    boutique:boutiques(name)
  `);

  if (filteredBoutiqueId) {
    ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
  }

  const { data: orders } = await ordersQuery;
  const validOrders = orders || [];

  // 2. Fetch Employee Referrals
  const referralsQuery = supabase.from("employee_referrals").select(`
    *,
    employee:users!employee_referrals_employee_id_fkey(name, boutique_id)
  `);

  const { data: referrals } = await referralsQuery;
  const validReferrals = referrals || [];

  // 3. Process Employee Stats
  const employeeStats: Record<
    string,
    {
      id: string;
      name: string;
      salesCount: number;
      revenue: number;
      referralsCount: number;
      boutique_id: string;
    }
  > = {};

  // Process Sales
  validOrders.forEach((order) => {
    if (!order.employee_id) return;
    const empId = order.employee_id;
    if (!employeeStats[empId]) {
      employeeStats[empId] = {
        id: empId,
        name: order.employee?.name || "Inconnu",
        salesCount: 0,
        revenue: 0,
        referralsCount: 0,
        boutique_id: order.employee?.boutique_id,
      };
    }
    employeeStats[empId].salesCount += 1;
    employeeStats[empId].revenue += Number(order.total);
  });

  // Process Referrals
  validReferrals.forEach((ref) => {
    if (!isGlobalScope && ref.employee?.boutique_id !== filteredBoutiqueId) {
      return;
    }
    const empId = ref.employee_id;
    if (!employeeStats[empId]) {
      employeeStats[empId] = {
        id: empId,
        name: ref.employee?.name || "Inconnu",
        salesCount: 0,
        revenue: 0,
        referralsCount: 0,
        boutique_id: ref.employee?.boutique_id,
      };
    }
    employeeStats[empId].referralsCount += 1;
  });

  const rankedEmployees = Object.values(employeeStats).sort((a, b) => {
    if (b.revenue !== a.revenue) return b.revenue - a.revenue;
    return b.salesCount - a.salesCount;
  });

  const totalRevenue = rankedEmployees.reduce(
    (sum, emp) => sum + emp.revenue,
    0,
  );
  const totalReferrals = rankedEmployees.reduce(
    (sum, emp) => sum + emp.referralsCount,
    0,
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Performances{" "}
            <span className="text-gradient leading-relaxed">Élite</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium italic">
            {isGlobalScope
              ? "Synthèse analytique du réseau de distribution"
              : "Analyse d&apos;efficacité de l&apos;unité locale"}
          </p>
        </div>
        {!isGlobalScope && (
          <div className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest italic">
            MODE ANALYSE BOUTIQUE
          </div>
        )}
      </section>

      {/* Analytics KPI Hub */}
      <div className="grid gap-10 md:grid-cols-3">
        <div className="rounded-[3.5rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-all opacity-20">
            <TrendingUp className="h-20 w-20" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground/60 italic mb-1">
                Volume de Production (Équipe)
              </p>
              <p className="text-4xl font-black tracking-tighter text-gradient">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[3.5rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-all opacity-20">
            <Users className="h-20 w-20" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20">
              <Target className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground/60 italic mb-1">
                Impact des Recommandations
              </p>
              <p className="text-5xl font-black tracking-tighter text-indigo-600 leading-none">
                {totalReferrals}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[3.5rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-orange-500/10 group-hover:text-orange-500/20 transition-all opacity-20">
            <Star className="h-20 w-20" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/20">
              <Medal className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground/60 italic mb-1">
                Capital Humain Actif
              </p>
              <p className="text-5xl font-black tracking-tighter text-orange-600 leading-none">
                {rankedEmployees.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table Layer */}
      <div className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-10 border-b border-border/50 bg-muted/30 flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-500 drop-shadow-glow" />
              Matrice d&apos;Excellence Opérationnelle
            </h3>
            <p className="text-sm text-muted-foreground font-medium italic tracking-widest opacity-40">
              Intelligence de performance individuelle
            </p>
          </div>
          <div className="px-6 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-black tracking-[0.2em] text-primary italic">
              RANKING 2.0
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-20 bg-muted/10">
                <th className="px-10 text-left">Pôle Position</th>
                <th className="px-10 text-left">Collaborateur</th>
                <th className="px-10 text-center">Volume Caisse</th>
                <th className="px-10 text-center">Referrals</th>
                <th className="px-10 text-right">Rendement Brut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {rankedEmployees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className="group hover:bg-primary/2 transition-colors h-28"
                >
                  <td className="px-10">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-2xl font-black text-xl flex items-center justify-center transition-transform group-hover:scale-110",
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/20"
                          : index === 1
                            ? "bg-slate-400/20 text-slate-500 border border-slate-400/20"
                            : index === 2
                              ? "bg-orange-500/20 text-orange-600 border border-orange-500/20"
                              : "bg-muted/50 text-muted-foreground/50 border border-border/50",
                      )}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-10">
                    <div className="flex flex-col">
                      <span className="font-black text-lg tracking-tighter leading-none">
                        {emp.name}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 italic tracking-widest mt-1 opacity-60">
                        MEMBRE CERTIFIÉ
                      </span>
                    </div>
                  </td>
                  <td className="px-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-black">
                      <Zap className="h-3 w-3 text-primary" />
                      {emp.salesCount}{" "}
                      <span className="text-[8px] opacity-40 ml-1">
                        TRANSACTIONS
                      </span>
                    </div>
                  </td>
                  <td className="px-10 text-center">
                    {emp.referralsCount > 0 ? (
                      <Badge className="bg-indigo-600 text-white border-none rounded-full px-4 py-1 font-black shadow-lg shadow-indigo-600/20">
                        +{emp.referralsCount} Points
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/20 italic font-bold">
                        Neutre
                      </span>
                    )}
                  </td>
                  <td className="px-10 text-right">
                    <p className="text-xl font-black text-primary tracking-tighter">
                      {formatCurrency(emp.revenue)}
                    </p>
                  </td>
                </tr>
              ))}
              {rankedEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-80 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6 opacity-10">
                      <Users className="h-20 w-20" />
                      <p className="text-xl font-black tracking-widest italic">
                        Signal de performance inexistant
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
