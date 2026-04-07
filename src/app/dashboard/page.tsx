import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  Package,
  Store as StoreIcon,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { subDays, startOfDay } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section";

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;
  const fromParam = searchParams.from as string | undefined;
  const toParam = searchParams.to as string | undefined;

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
      <div className="flex flex-col items-center justify-center h-150 gap-4">
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
  const filteredBoutiqueId = !isGlobalScope
    ? role === "admin"
      ? boutiqueSwitcherId
      : profile?.boutique_id
    : null;

  // Strict enforcement: if non-admin tries to use a different boutiqueId in URL, redirect or force their own
  if (
    role !== "admin" &&
    boutiqueSwitcherId &&
    boutiqueSwitcherId !== profile?.boutique_id
  ) {
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

  const range = (searchParams.range as string) || "today";

  // Calculate Date Filters
  let dateFilterStart: string | null = null;
  let dateFilterEnd: string | null = null;

  if (range === "today") dateFilterStart = startOfDay(new Date()).toISOString();
  else if (range === "7d")
    dateFilterStart = subDays(new Date(), 7).toISOString();
  else if (range === "30d")
    dateFilterStart = subDays(new Date(), 30).toISOString();
  else if (range === "custom") {
    if (fromParam) dateFilterStart = new Date(fromParam).toISOString();
    if (toParam) {
      // Set to the very end of the selected day
      const endDate = new Date(toParam);
      endDate.setHours(23, 59, 59, 999);
      dateFilterEnd = endDate.toISOString();
    }
  }

  // Fetch orders with optional date filter
  let ordersQuery = supabase.from("orders").select(`
      *,
      order_items(product_id, quantity, products(name)),
      boutique:boutiques(name),
      employee:users!orders_employee_id_fkey(name)
    `);

  if (filteredBoutiqueId) {
    ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
  }

  if (dateFilterStart) {
    ordersQuery = ordersQuery.gte("created_at", dateFilterStart);
  }
  if (dateFilterEnd) {
    ordersQuery = ordersQuery.lte("created_at", dateFilterEnd);
  }

  const { data: orders } = await ordersQuery;
  const validOrders = orders || [];

  // Fetch all boutiques for the Global HUD (Admin only)
  const { data: boutiques } = await supabase
    .from("boutiques")
    .select("*")
    .order("name");

  // Today's metrics
  const today = startOfDay(new Date());
  const todayIso = today.toISOString();

  const todayOrders = validOrders.filter((o) => o.created_at >= todayIso);

  // Team Performance (for Manager/Admin)
  const teamSales: Record<
    string,
    { name: string; total: number; count: number }
  > = {};
  if (role === "admin" || role === "manager") {
    todayOrders.forEach((order) => {
      const empId = order.employee_id;
      const empName = order.employee?.name || "Anonyme";
      if (!teamSales[empId]) {
        teamSales[empId] = { name: empName, total: 0, count: 0 };
      }
      teamSales[empId].total += Number(order.total);
      teamSales[empId].count += 1;
    });
  }

  // --- RECENT ORDERS ---
  const recentOrders = [...validOrders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  // --- LOW STOCK ALERTS ---
  let lowStockProducts: {
    quantity: number;
    products:
      | { name: string; min_stock_alert: number }
      | { name: string; min_stock_alert: number }[]
      | null;
  }[] = [];
  if (role === "admin" || role === "manager") {
    const stockQuery = supabase
      .from("stocks")
      .select("quantity, products(name, min_stock_alert)")
      .lt("quantity", 15);

    if (filteredBoutiqueId) {
      stockQuery.eq("boutique_id", filteredBoutiqueId);
    }

    const { data: stockData } = await stockQuery;
    lowStockProducts = (stockData || []) as {
      quantity: number;
      products:
        | { name: string; min_stock_alert: number }
        | { name: string; min_stock_alert: number }[]
        | null;
    }[];
    lowStockProducts = lowStockProducts
      .filter((s) => {
        const prod = Array.isArray(s.products) ? s.products[0] : s.products;
        return s.quantity <= (prod?.min_stock_alert || 5);
      })
      .slice(0, 5);
  }

  const hoursNow = new Date().getHours();
  const greeting =
    hoursNow < 12 ? "Bonjour" : hoursNow < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter leading-tight animate-in slide-in-from-left duration-700">
            {greeting},{" "}
            <span className="text-gradient leading-relaxed">
              {profile?.name || "Admin"}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground/80 font-medium max-w-2xl leading-relaxed">
            {isGlobalScope
              ? "Heureux de vous revoir. Voici l'état global de votre réseau de boutiques aujourd'hui."
              : `Heureux de vous revoir. Voici les performances de la boutique ${currentBoutiqueName} aujourd'hui.`}
          </p>
        </div>

        <div className="flex gap-4 h-fit">
          {/* Removed action buttons as requested */}
        </div>
      </section>

      {/* Filter Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50 shadow-premium">
        <div className="flex items-center gap-4">
          <Clock className="h-5 w-5 text-primary/40" />
          <h2 className="text-xl font-black tracking-tighter italic">
            Période <span className="text-primary">d&apos;Analyse</span>
          </h2>
        </div>
        <DashboardFilters />
      </section>

      {/* Strategic Navigation */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <Link
          href={
            filteredBoutiqueId
              ? `/dashboard/analyses?boutiqueId=${filteredBoutiqueId}`
              : "/dashboard/analyses"
          }
          className="group relative h-44 overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl p-10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <TrendingUp className="h-24 w-24 text-indigo-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-4 shadow-sm group-hover:rotate-6 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter">Analyses</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 tracking-tight leading-none mt-2">
                Performances du réseau
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={
            filteredBoutiqueId
              ? `/dashboard/comptabilite?boutiqueId=${filteredBoutiqueId}`
              : "/dashboard/comptabilite"
          }
          className="group relative h-44 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <DollarSign className="h-24 w-24 text-emerald-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4 shadow-sm group-hover:rotate-6 transition-transform">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter">
                Comptabilité
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 tracking-tight leading-none mt-2">
                Transactions & Flux
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/clients"
          className="group relative h-44 overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl p-10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10"
        >
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <Users className="h-24 w-24 text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb-4 shadow-sm group-hover:rotate-6 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter">Clients</h3>
              <p className="text-[10px] font-bold text-muted-foreground/40 tracking-tight leading-none mt-2">
                Gestion du répertoire
              </p>
            </div>
          </div>
        </Link>
      </section>

      {/* GLOBAL HUD - Multi-store Hub (Admin ONLY) */}
      {isGlobalScope && boutiques && boutiques.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black tracking-tighter">
              Accès <span className="text-primary">Boutiques</span>
            </h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {boutiques.map(
              (
                b: { id: string; name: string; address: string },
                index: number,
              ) => {
                interface Order {
                  boutique_id: string;
                  total: string | number;
                }
                const bOrders = validOrders.filter(
                  (o: unknown) => (o as Order).boutique_id === b.id,
                ) as unknown[] as Order[];
                const bRevenue = bOrders.reduce(
                  (s: number, o: Order) => s + Number(o.total),
                  0,
                );
                return (
                  <Link key={b.id} href={`/dashboard?boutiqueId=${b.id}`}>
                    <div
                      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <StoreIcon className="h-20 w-20 text-primary" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black tracking-widest text-primary mb-1">
                            {b.address}
                          </span>
                          <h4 className="text-2xl font-black tracking-tighter">
                            {b.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest">
                              Revenu Total
                            </p>
                            <p className="text-xl font-black">
                              {formatCurrency(bRevenue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest">
                              Ventes
                            </p>
                            <p className="text-xl font-black">
                              {bOrders.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        </section>
      )}

      {/* Main KPI Grid */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardChartsSection
          filteredBoutiqueId={filteredBoutiqueId}
          dateFilter={dateFilterStart}
          range={range}
        />
      </Suspense>

      {/* Operations Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 p-10 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-black tracking-tighter">
              Transactions <span className="text-primary">Récentes</span>
            </h3>
            <Link
              href={
                filteredBoutiqueId
                  ? `/dashboard/orders?boutiqueId=${filteredBoutiqueId}`
                  : "/dashboard/orders"
              }
            >
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
                  <p className="text-sm font-black truncate">
                    {inv.client_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest">
                    Boutique: {inv.boutique?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black">
                    {formatCurrency(inv.total)}
                  </p>
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
          <div className="p-10 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium grow">
            <h3 className="text-2xl font-black tracking-tighter mb-8 italic text-rose-600 flex items-center gap-3">
              <Package className="h-6 w-6" /> Stock Critique
            </h3>
            <div className="space-y-4">
              {lowStockProducts.map((a, i) => {
                const prod = Array.isArray(a.products)
                  ? a.products[0]
                  : a.products;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black truncate">
                        {prod?.name}
                      </p>
                      <p className="text-[10px] font-bold text-rose-600 tracking-tighter">
                        {a.quantity} unités restantes
                      </p>
                    </div>
                    <Link
                      href={
                        filteredBoutiqueId
                          ? `/dashboard/stocks?boutiqueId=${filteredBoutiqueId}`
                          : "/dashboard/stocks"
                      }
                    >
                      <button className="p-3 rounded-2xl bg-card border border-border/50 text-muted-foreground hover:text-rose-600 transition-all group-hover:scale-110">
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                );
              })}
              {lowStockProducts.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-30">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
                  <div className="text-[10px] font-black tracking-widest">
                    Stock optimisé
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-10 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-premium">
            <h3 className="text-2xl font-black tracking-tighter mb-8">
              Staff <span className="text-primary">Performance</span>
            </h3>
            <div className="space-y-4">
              {Object.entries(teamSales)
                .slice(0, 3)
                .map(([id, stats]) => (
                  <div
                    key={id}
                    className="p-5 rounded-3xl bg-secondary/30 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                        {stats.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black truncate">
                          {stats.name}
                        </p>
                        <p className="text-[10px] font-black tracking-widest opacity-60 italic">
                          {stats.count} commandes
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-primary">
                      {formatCurrency(stats.total)}
                    </p>
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
