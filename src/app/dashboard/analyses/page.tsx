import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  Sparkles,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Search,
  Calendar,
  Users,
  Trophy,
  UserCheck,
} from "lucide-react";
import { format, subDays, startOfDay, subHours } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AreaRevenueChart,
  CategoryPieChart,
} from "@/components/dashboard/dashboard-charts";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AnalysesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const range = (searchParams.range as string) || "today";
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
  const isGlobalScope = profile?.role === "admin" && !boutiqueSwitcherId;
  const filteredBoutiqueId = !isGlobalScope
    ? profile?.role === "admin"
      ? boutiqueSwitcherId
      : profile?.boutique_id
    : null;

  // Calculate Date Filters
  let dateFilter: string | null = null;
  if (range === "today") dateFilter = startOfDay(new Date()).toISOString();
  else if (range === "7d") dateFilter = subDays(new Date(), 7).toISOString();
  else if (range === "30d") dateFilter = subDays(new Date(), 30).toISOString();

  // Fetch Orders
  let ordersQuery = supabase.from("orders").select(`
    *,
    order_items(product_id, quantity, products(name, category_id, categories(name)))
  `);
  if (filteredBoutiqueId)
    ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
  if (dateFilter) ordersQuery = ordersQuery.gte("created_at", dateFilter);

  const { data: orders } = await ordersQuery;
  const validOrders = orders || [];

  // 1. Revenue over time (Last 12 samples based on range)
  const samples = range === "today" ? 12 : 7;
  const timeData = Array.from({ length: samples }, (_, i) => {
    // If today, samples are hours. If 7d/30d, samples are days.
    const d =
      range === "today"
        ? subHours(new Date(), samples - 1 - i)
        : subDays(new Date(), samples - 1 - i);

    return {
      dateStr: d.toISOString().split("T")[0],
      display: format(d, range === "today" ? "HH:mm" : "EEE d", { locale: fr }),
      fullIso: d.toISOString().substring(0, range === "today" ? 13 : 10),
    };
  });

  const revenueSeries = timeData.map((t) => {
    const total = validOrders
      .filter((o) => o.created_at.startsWith(t.fullIso))
      .reduce((s, o) => s + Number(o.total), 0);
    return { date: t.display, total };
  });

  // 2. Category Distribution
  const categoryStats: Record<string, number> = {};
  validOrders.forEach((order) => {
    order.order_items?.forEach((item: any) => {
      const catName = item.products?.categories?.name || "Sans catégorie";
      categoryStats[catName] = (categoryStats[catName] || 0) + item.quantity;
    });
  });
  const categoryData = Object.entries(categoryStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 3. Employee Referral Stats
  const referralStats: Record<string, { count: number; revenue: number }> = {};
  validOrders.forEach((order) => {
    if (order.referred_employee_name) {
      const name = order.referred_employee_name;
      if (!referralStats[name]) referralStats[name] = { count: 0, revenue: 0 };
      referralStats[name].count += 1;
      referralStats[name].revenue += Number(order.total);
    }
  });
  const referralData = Object.entries(referralStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Analyses de{" "}
            <span className="text-gradient leading-relaxed">Performance</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium tracking-tight mt-2">
            Suivi des ventes et distribution par catégorie
          </p>
        </div>
        <DashboardFilters />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Revenue Evolution */}
        <div className="rounded-[3.5rem] border border-border/50 bg-card/40 backdrop-blur-xl p-10 flex flex-col space-y-8 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <LineIcon className="h-32 w-32 text-primary" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter">
                Évolution du C.A.
              </h3>
              <p className="text-sm text-muted-foreground font-medium italic">
                Tendances monétaires sur la période
              </p>
            </div>
          </div>
          <div className="h-[450px] w-full pt-4">
            {revenueSeries.some((s) => s.total > 0) ? (
              <AreaRevenueChart data={revenueSeries} />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center space-y-4 opacity-30 border border-dashed rounded-[2rem]">
                <TrendingUp className="h-12 w-12" />
                <p className="text-sm font-bold tracking-tight text-muted-foreground/60 leading-none">
                  Aucun revenu sur cette période
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-[3.5rem] border border-border/50 bg-card/40 backdrop-blur-xl p-10 flex flex-col space-y-8 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <PieIcon className="h-32 w-32 text-indigo-500" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <PieIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter">
                Répartition par Catégorie
              </h3>
              <p className="text-sm text-muted-foreground font-medium italic">
                Volume de ventes par segment de produits
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center pt-4">
            {categoryData.length > 0 ? (
              <CategoryPieChart data={categoryData} />
            ) : (
              <div className="h-48 w-full flex flex-col items-center justify-center space-y-4 opacity-30 border border-dashed rounded-[2rem]">
                <PieIcon className="h-10 w-10" />
                <p className="text-xs font-bold tracking-tight text-muted-foreground/60 leading-tight text-center">
                  Données de catégories <br /> indisponibles
                </p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {categoryData.slice(0, 4).map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/20"
              >
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    i === 0
                      ? "bg-primary"
                      : i === 1
                        ? "bg-amber-500"
                        : "bg-indigo-500",
                  )}
                />
                <span className="text-xs font-black tracking-tight">
                  {c.name}
                </span>
                <span className="ml-auto text-xs font-bold opacity-40">
                  {c.value} u.
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Referral Recap - Requested Feature */}
      {isGlobalScope && (
        <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                <Trophy className="h-6 w-6 text-yellow-500" /> Performance des{" "}
                <span className="text-primary">Apporteurs</span>
              </h2>
              <p className="text-sm text-muted-foreground font-medium italic">
                Nombre de clients et chiffre d&apos;affaires par collaborateur
              </p>
            </div>
            <div className="px-5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-black tracking-widest uppercase">
              Recap Global
            </div>
          </div>

          {referralData.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {referralData.map((ref, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/60 backdrop-blur-xl p-8 hover:shadow-premium-hover transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                    <UserCheck className="h-16 w-16 text-primary" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner",
                          i === 0
                            ? "bg-yellow-500/20 text-yellow-600"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {i + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-xl tracking-tighter leading-none mb-1">
                          {ref.name}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest italic">
                          Collaborateur Apporteur
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-2xl bg-secondary/20 border border-border/10">
                        <p className="text-[9px] font-black text-muted-foreground/60 tracking-widest leading-none mb-2">
                          Cli. Apportés
                        </p>
                        <p className="text-2xl font-black tracking-tighter">
                          {ref.count}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <p className="text-[9px] font-black text-primary/60 tracking-widest leading-none mb-2">
                          C.A. Généré
                        </p>
                        <p className="text-lg font-black tracking-tighter">
                          {formatCurrency(ref.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center rounded-[3rem] border border-dashed border-border/50 bg-muted/20 opacity-30">
              <Users className="h-16 w-16 mx-auto mb-6" />
              <p className="text-lg font-black tracking-widest italic">
                Aucun apport d&apos;affaire enregistré sur cette période
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
