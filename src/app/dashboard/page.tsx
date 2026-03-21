import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DollarSign,
  Package,
  ShoppingBag,
  Store as StoreIcon,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  SparkAreaChart,
} from "@/components/dashboard/dashboard-charts";
import { PremiumStatCard } from "@/components/dashboard/premium-stat-card";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductFormModal } from "@/components/products/product-form-modal";

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Middleware handles redirect
  }

  // Get user profile details
  const { data: profile } = await supabase
    .from("users")
    .select("*, boutique:boutiques(name)")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // If client, redirect to profile or shop (safeguard)
  if (role === "client") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">
          Bienvenue sur votre espace personnel
        </h1>
        <p className="text-muted-foreground">
          Vous pouvez consulter vos commandes et votre profil.
        </p>
        <Link href="/dashboard/profile">
          <Button>Voir mon profil</Button>
        </Link>
      </div>
    );
  }

  const isGlobalScope = role === "admin" && !boutiqueSwitcherId;
  const filteredBoutiqueId = !isGlobalScope ? (role === "admin" ? boutiqueSwitcherId : profile?.boutique_id) : null;

  // Strict enforcement: if non-admin tries to use a different boutiqueId in URL, redirect or force their own
  if (role !== "admin" && boutiqueSwitcherId && boutiqueSwitcherId !== profile?.boutique_id) {
    // Hidden enforcement: we use profile?.boutique_id anyway but let's be clean
  }

  // Fetch selected boutique name for display
  let currentBoutiqueName = "";
  if (filteredBoutiqueId) {
    const { data: bData } = await supabase
      .from("boutiques")
      .select("name")
      .eq("id", filteredBoutiqueId)
      .single();
    currentBoutiqueName = bData?.name || "Ma Boutique";
  } else {
    currentBoutiqueName = "Réseau (Global)";
  }

  // Fetch orders for the filtered boutique
  let ordersQuery = supabase.from("orders").select(`
      *,
      order_items(product_id, quantity, products(name)),
      boutique:boutiques(name),
      employee:users!orders_employee_id_fkey(name)
    `);

  if (filteredBoutiqueId) {
    ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
  }

  const { data: orders } = await ordersQuery;
  const validOrders = orders || [];

  // Fetch all boutiques for the Global HUD (Admin only)
  const { data: boutiques } = await supabase
    .from("boutiques")
    .select("*")
    .order("name");

  // Metrics
  const totalOrders = validOrders.length;
  const totalRevenue = validOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  // Today's metrics
  const today = startOfDay(new Date());
  const todayIso = today.toISOString();
  const yesterday = subDays(today, 1);
  const yesterdayIsoStart = yesterday.toISOString();
  const yesterdayIsoEnd = todayIso;

  const todayOrders = validOrders.filter((o) => o.created_at >= todayIso);
  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );
  
  const yesterdayOrdersList = validOrders.filter((o) => o.created_at >= yesterdayIsoStart && o.created_at < yesterdayIsoEnd);
  const yesterdayRevenue = yesterdayOrdersList.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const revenueTrend = calcTrend(todayRevenue, yesterdayRevenue);
  const ordersTrend = calcTrend(todayOrders.length, yesterdayOrdersList.length);

  // Personal Sales (for anyone)
  const myTodayOrders = todayOrders.filter((o) => o.employee_id === user.id);
  const myTodayRevenue = myTodayOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  // Team Performance (for Manager/Admin)
  const teamSales: Record<string, { name: string; total: number; count: number }> = {};
  if (role === "admin" || role === "manager") {
    todayOrders.forEach(order => {
      const empId = order.employee_id;
      const empName = order.employee?.name || "Anonyme";
      if (!teamSales[empId]) {
        teamSales[empId] = { name: empName, total: 0, count: 0 };
      }
      teamSales[empId].total += Number(order.total);
      teamSales[empId].count += 1;
    });
  }

  // --- REVENUE OVER TIME (Last 7 Days) ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      dateStr: d.toISOString().split("T")[0],
      display: format(d, "EEE d", { locale: fr }),
    };
  });

  const revenueData = last7Days.map((day) => {
    const dailyTotal = validOrders
      .filter((o) => o.created_at.startsWith(day.dateStr))
      .reduce((sum, o) => sum + Number(o.total), 0);
    return { date: day.display, total: dailyTotal };
  });

  // --- TOP PRODUCTS ---
  const productSales: Record<string, { name: string; quantity: number }> = {};
  validOrders.forEach((order: any) => {
    order.order_items?.forEach((item: any) => {
      const pName = item.products?.name || "Inconnu";
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { name: pName, quantity: 0 };
      }
      productSales[item.product_id].quantity += item.quantity;
    });
  });

  const topProductsData = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // --- BOUTIQUE SPLIT (Admin ONLY) ---
  const boutiqueSales: Record<string, number> = {};
  if (isGlobalScope) {
    validOrders.forEach((order) => {
      const bName = (order as any).boutique?.name || "Autre";
      boutiqueSales[bName] = (boutiqueSales[bName] || 0) + Number(order.total);
    }
    );
  }

  // --- RECENT ORDERS ---
  const recentOrders = [...validOrders]
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  // --- LOW STOCK ALERTS ---
  let lowStockProducts: any[] = [];
  if (role === "admin" || role === "manager") {
    const stockQuery = supabase
      .from("stocks")
      .select("quantity, products(name, min_stock_alert)")
      .lt("quantity", 15);

    if (filteredBoutiqueId) {
      stockQuery.eq("boutique_id", filteredBoutiqueId);
    }

    const { data: stockData } = await stockQuery;
    lowStockProducts = (stockData || [])
      .filter((s) => {
        const prod = Array.isArray(s.products) ? s.products[0] : s.products;
        return s.quantity <= (prod?.min_stock_alert || 5);
      })
      .slice(0, 5);
  }

  const sparklineData = revenueData.map((d) => d.total);
  const sparklineLabels = revenueData.map((d) => d.date);

  const hoursNow = new Date().getHours();
  const greeting =
    hoursNow < 12 ? "Bonjour" : hoursNow < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-16 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter leading-tight animate-in slide-in-from-left duration-700">
              {greeting}, <span className="text-gradient leading-relaxed">{profile?.name || "Admin"}</span>
            </h1>
            <p className="text-xl text-muted-foreground/80 font-medium max-w-2xl leading-relaxed">
              {isGlobalScope 
                ? "Heureux de vous revoir. Voici l'état global de votre réseau de boutiques aujourd'hui."
                : `Heureux de vous revoir. Voici les performances de la boutique ${currentBoutiqueName} aujourd'hui.`}
            </p>
          </div>

        <div className="flex gap-4 h-fit">
          <Link
            href={
              filteredBoutiqueId
                ? `/dashboard/pos?boutiqueId=${filteredBoutiqueId}`
                : "/dashboard/pos"
            }
          >
            <Button
              className="rounded-full px-12 h-20 bg-primary text-white font-black tracking-tight text-lg shadow-3xl hover:scale-105 active:scale-95 transition-all group overflow-hidden"
            >
              Effectuer une Vente
              <Zap className="ml-3 h-5 w-5 fill-current" />
            </Button>
          </Link>
          
          {(role === "admin" || role === "manager") && (
             <ProductFormModal 
               categories={categories || []} 
               userRole={role}
               userBoutiqueId={profile.boutique_id}
               boutiques={boutiques || []}
             />
          )}
        </div>
      </section>

      {/* GLOBAL HUD - Multi-store Hub (Admin ONLY) */}
      {isGlobalScope && boutiques && boutiques.length > 0 && (
        <section className="space-y-8">
           <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black tracking-tighter">Accès <span className="text-primary">Boutiques</span></h3>
              <div className="h-px flex-1 bg-border/50" />
           </div>
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {boutiques.map((b: { id: string; name: string; address: string }, index: number) => {
              const bOrders = validOrders.filter((o: any) => o.boutique_id === b.id);
              const bRevenue = bOrders.reduce((s: number, o: any) => s + Number(o.total), 0);
              return (
                <Link key={b.id} href={`/dashboard?boutiqueId=${b.id}`}>
                  <div className="group relative overflow-hidden rounded-[3rem] border border-border/50 bg-card/40 backdrop-blur-xl p-8 transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <StoreIcon className="h-20 w-20 text-primary" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black tracking-widest text-primary mb-1">{b.address}</span>
                        <h4 className="text-2xl font-black tracking-tighter">{b.name}</h4>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest">Revenu Total</p>
                          <p className="text-xl font-black">{formatCurrency(bRevenue)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest">Ventes</p>
                          <p className="text-xl font-black">{bOrders.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Main KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <PremiumStatCard
          title={role === "employee" ? "Mon CA du Jour" : "Chiffre d'Affaires"}
          value={formatCurrency(role === "employee" ? myTodayRevenue : totalRevenue)}
          iconName="DollarSign"
          description={role === "employee" ? "Total de mes ventes aujourd'hui" : "CA total enregistré sur la période"}
          trend={revenueTrend}
          delay={100}
        />
        <PremiumStatCard
          title="Volume Commandes"
          value={totalOrders}
          iconName="ShoppingBag"
          description="Nombre total de transactions"
          trend={ordersTrend}
          delay={200}
        />
        <PremiumStatCard
          title="CA du Jour"
          value={formatCurrency(todayRevenue)}
          iconName="TrendingUp"
          description="Performance globale aujourd'hui"
          trend={revenueTrend}
          delay={300}
        />
        <PremiumStatCard
          title={isGlobalScope ? "Réseau de Vente" : "Point de Vente"}
          value={isGlobalScope ? `${boutiques?.length || 0} Boutiques` : currentBoutiqueName}
          iconName="Store"
          description={isGlobalScope ? "Points de vente actifs" : "Boutique d'affectation actuelle"}
          delay={400}
        />
      </section>

      {/* Analytics visualization */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 p-10 rounded-[4rem] bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-3xl font-black tracking-tighter">
                Analyse des <span className="text-primary">Ventes</span>
              </h3>
              <p className="text-xs font-bold text-muted-foreground mt-1 tracking-widest">
                Cycle hebdomadaire
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-transform group-hover:scale-110",
                revenueTrend >= 0
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-rose-500/10 text-rose-600"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-widest">
                {revenueTrend >= 0 ? "En hausse" : "En baisse"}
              </span>
            </div>
          </div>
          
          <SparkAreaChart data={sparklineData} labels={sparklineLabels} height={250} />
        </div>

        <div className="p-10 rounded-[4rem] bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium">
          <h3 className="text-3xl font-black tracking-tighter mb-10">
            Top <span className="text-primary">Produits</span>
          </h3>
          <div className="space-y-8">
            {topProductsData.map((p, i) => (
              <div key={i} className="space-y-2 group">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-foreground truncate max-w-[150px] group-hover:text-primary transition-colors">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-black text-primary">
                    {p.quantity} ventes
                  </span>
                </div>
                <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{
                      width: `${(p.quantity / (topProductsData[0]?.quantity || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {topProductsData.length === 0 && (
              <div className="py-20 text-center opacity-30">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p className="text-xs font-black tracking-widest text-center">Aucune donnée</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Operations Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 p-10 rounded-[4rem] bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-black tracking-tighter">
              Transactions <span className="text-primary">Récentes</span>
            </h3>
            <Link href={filteredBoutiqueId ? `/dashboard/orders?boutiqueId=${filteredBoutiqueId}` : "/dashboard/orders"}>
              <button className="text-[10px] font-black tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                Tout voir <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-6 p-6 rounded-3xl hover:bg-secondary/50 transition-all border border-transparent hover:border-border/50 group cursor-pointer"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black group-hover:scale-110 transition-transform">
                  {inv.client_name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{inv.client_name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest">
                    Boutique: {inv.boutique?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black">{formatCurrency(inv.total)}</p>
                  <p className="text-[9px] font-black text-emerald-600 tracking-widest">
                    Confirmé
                  </p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="py-20 text-center text-sm font-black opacity-30 tracking-widest">
                Aucune activité récente
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="p-10 rounded-[4rem] bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium grow">
            <h3 className="text-2xl font-black tracking-tighter mb-8 italic text-rose-600 flex items-center gap-3">
              <Package className="h-6 w-6" /> Stock Critique
            </h3>
            <div className="space-y-4">
              {lowStockProducts.map((a, i) => {
                const prod = Array.isArray(a.products) ? a.products[0] : a.products;
                return (
                  <div key={i} className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between group">
                    <div className="min-w-0">
                      <p className="text-sm font-black truncate">{prod?.name}</p>
                      <p className="text-[10px] font-bold text-rose-600 tracking-tighter">
                        {a.quantity} unités restantes
                      </p>
                    </div>
                    <Link href={filteredBoutiqueId ? `/dashboard/stocks?boutiqueId=${filteredBoutiqueId}` : "/dashboard/stocks"}>
                      <button className="p-3 rounded-2xl bg-card border border-border/50 text-muted-foreground hover:text-rose-600 transition-all group-hover:scale-110">
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                );
              })}
              {lowStockProducts.length === 0 && (
                <div className="py-20 text-center text-[10px] font-black tracking-widest opacity-30">
                  Stock optimisé ✅
                </div>
              )}
            </div>
          </div>

          <div className="p-10 rounded-[4rem] bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium">
            <h3 className="text-2xl font-black tracking-tighter mb-8">
              Staff <span className="text-primary">Performance</span>
            </h3>
            <div className="space-y-4">
               {Object.entries(teamSales).slice(0, 3).map(([id, stats]) => (
                <div key={id} className="p-5 rounded-3xl bg-secondary/30 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                      {stats.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black truncate">{stats.name}</p>
                      <p className="text-[10px] font-black tracking-widest opacity-60 italic">
                        {stats.count} commandes
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-primary">{formatCurrency(stats.total)}</p>
                </div>
              ))}
               {Object.keys(teamSales).length === 0 && (
                <p className="py-10 text-center text-[10px] font-black tracking-widest opacity-30 italic">
                  Aucune vente d&apos;équipe
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
