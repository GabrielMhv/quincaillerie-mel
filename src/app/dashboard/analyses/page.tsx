import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, Sparkles, PieChart as PieIcon, LineChart as LineIcon, Search, Calendar } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { AreaRevenueChart, CategoryPieChart } from "@/components/dashboard/dashboard-charts";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";

export default async function AnalysesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const range = (searchParams.range as string) || "7d";
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("users").select("role, boutique_id").eq("id", user.id).single();
  const isGlobalScope = profile?.role === "admin" && !boutiqueSwitcherId;
  const filteredBoutiqueId = !isGlobalScope ? (profile?.role === "admin" ? boutiqueSwitcherId : profile?.boutique_id) : null;

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
  if (filteredBoutiqueId) ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
  if (dateFilter) ordersQuery = ordersQuery.gte("created_at", dateFilter);

  const { data: orders } = await ordersQuery;
  const validOrders = orders || [];

  // 1. Revenue over time (Last 7 samples based on range)
  const samples = range === "today" ? 12 : 7; // Hours if today, days if 7d/30d
  const timeData = Array.from({ length: samples }, (_, i) => {
    const d = subDays(new Date(), samples - 1 - i);
    return {
      dateStr: d.toISOString().split("T")[0],
      display: format(d, range === "today" ? "HH:mm" : "EEE d", { locale: fr }),
    };
  });

  const revenueSeries = timeData.map(t => {
    const total = validOrders
      .filter(o => o.created_at.startsWith(t.dateStr))
      .reduce((s, o) => s + Number(o.total), 0);
    return { date: t.display, total };
  });

  // 2. Category Distribution
  const categoryStats: Record<string, number> = {};
  validOrders.forEach(order => {
    order.order_items?.forEach((item: any) => {
      const catName = item.products?.categories?.name || "Sans catégorie";
      categoryStats[catName] = (categoryStats[catName] || 0) + item.quantity;
    });
  });
  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Analyses de <span className="text-gradient leading-relaxed">Performance</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium italic">
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
                  <h3 className="text-2xl font-black tracking-tighter">Évolution du C.A.</h3>
                  <p className="text-sm text-muted-foreground font-medium italic">Tendances monétaires sur la période</p>
               </div>
            </div>
            <div className="h-[450px] w-full pt-4">
               <AreaRevenueChart data={revenueSeries} />
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
                  <h3 className="text-2xl font-black tracking-tighter">Répartition par Catégorie</h3>
                  <p className="text-sm text-muted-foreground font-medium italic">Volume de ventes par segment de produits</p>
               </div>
            </div>
            <div className="flex-1 flex items-center justify-center pt-4">
               <CategoryPieChart data={categoryData} />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
               {categoryData.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/20">
                     <div className={cn("h-3 w-3 rounded-full", i === 0 ? "bg-primary" : i === 1 ? "bg-amber-500" : "bg-indigo-500")} />
                     <span className="text-xs font-black tracking-tight">{c.name}</span>
                     <span className="ml-auto text-xs font-bold opacity-40">{c.value} u.</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
