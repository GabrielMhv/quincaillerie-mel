import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import { TrendingUp, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { SparkAreaChart } from "@/components/dashboard/dashboard-charts";
import { PremiumStatCard } from "@/components/dashboard/premium-stat-card";
import {
  format,
  subDays,
  startOfDay,
  eachDayOfInterval,
  eachHourOfInterval,
  isSameDay,
  isSameHour,
} from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function DashboardChartsSection({
  filteredBoutiqueId,
  dateFilter,
  range,
}: {
  filteredBoutiqueId: string | null;
  dateFilter: string | null;
  range: string;
}) {
  const supabase = await createClient();

  // 1. Stats Calculation
  // Orders query
  const ordersQuery = supabase
    .from("orders")
    .select("id, total, status, created_at, boutique_id");

  if (filteredBoutiqueId) {
    ordersQuery.eq("boutique_id", filteredBoutiqueId);
  }

  if (dateFilter) {
    ordersQuery.gte("created_at", dateFilter);
  }

  const { data: dbOrders } = await ordersQuery;
  const orders = dbOrders || [];

  const totalSales =
    orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0;
  const numOrders = orders.length || 0;
  const pendingOrders =
    orders.filter((o) => o.status === "pending").length || 0;
  const completedOrders =
    orders.filter((o) => o.status === "completed").length || 0;

  // Products and Stocks queries
  const productsQuery = supabase
    .from("products")
    .select("id, stocks(quantity, boutique_id)");

  if (filteredBoutiqueId) {
    productsQuery.eq("stocks.boutique_id", filteredBoutiqueId);
  }

  const { data: products } = await productsQuery;
  const totalProducts = products?.length || 0;

  // 3. REAL Chart Data Generation (Basing it on actual DB orders)
  let chartData: { value: number; date: string }[] = [];
  const chartColors = [
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  if (range === "today") {
    const start = startOfDay(new Date());
    const end = new Date();
    const hours = eachHourOfInterval({ start, end });

    chartData = hours.map((hour) => {
      const value = orders
        .filter((o) => isSameHour(new Date(o.created_at), hour))
        .reduce((sum, o) => sum + Number(o.total), 0);
      return { value, date: format(hour, "HH:mm") };
    });
  } else {
    const days = range === "7d" ? 7 : 30;
    const start = subDays(new Date(), days - 1);
    const end = new Date();
    const intervals = eachDayOfInterval({ start, end });

    chartData = intervals.map((day) => {
      const value = orders
        .filter((o) => isSameDay(new Date(o.created_at), day))
        .reduce((sum, o) => sum + Number(o.total), 0);
      return { value, date: format(day, "EEE d", { locale: fr }) };
    });
  }

  return (
    <div className="space-y-12">
      {/* Primary Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <PremiumStatCard
          title="Chiffre d'Affaires"
          value={formatCurrency(totalSales)}
          iconName="DollarSign"
          trend={12.4}
          description="Revenus réels encaissés"
          className="bg-primary/5"
        />
        <PremiumStatCard
          title="Commandes"
          value={numOrders.toString()}
          iconName="ShoppingBag"
          trend={8}
          description="Volume de transactions"
          className="bg-indigo-500/5 shadow-indigo-500/5 border-indigo-500/20"
        />
        <PremiumStatCard
          title="Clients Actifs"
          value="1,284"
          iconName="Users"
          trend={22}
          description="Nouveaux comptes"
          className="bg-emerald-500/5 shadow-emerald-500/5 border-emerald-500/20"
        />
        <PremiumStatCard
          title="Produits"
          value={totalProducts.toString()}
          iconName="Package"
          description="Au catalogue"
          className="bg-amber-500/5 shadow-amber-500/5 border-amber-500/20"
        />
      </section>

      {/* Secondary Status Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-10 shadow-premium group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-40 w-40 text-primary" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
            <div>
              <h3 className="text-3xl font-black tracking-tighter leading-none mb-2">
                Performance <span className="text-gradient">Boutique</span>
              </h3>
              <p className="text-sm font-medium text-muted-foreground italic">
                Évolution réelle des revenus encaissés
              </p>
            </div>
            <Link href="/dashboard/analyses">
              <Button
                variant="outline"
                className="rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black tracking-widest text-[10px] italic shadow-xs"
              >
                Aller au Terminal <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="h-80 w-full relative z-10">
            <SparkAreaChart
              data={chartData.map((d) => d.value)}
              labels={chartData.map((d) => d.date)}
              height={320}
              colors={[chartColors[0]]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex-1 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-10 shadow-premium relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="h-14 w-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Clock className="h-7 w-7" />
              </div>
              <Badge className="rounded-full px-4 py-1 border-amber-500/20 bg-amber-500/5 text-amber-600 text-[10px] font-black tracking-widest italic">
                En Attente
              </Badge>
            </div>
            <h4 className="text-4xl font-black tracking-tighter mb-1">
              {pendingOrders}
            </h4>
            <p className="text-sm font-medium text-muted-foreground italic mb-6">
              Commandes à traiter
            </p>
            <div className="w-full bg-muted/30 h-3 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width: `${numOrders > 0 ? (pendingOrders / numOrders) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-border/40 bg-emerald-500/5 backdrop-blur-xl p-10 shadow-premium relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <Badge className="rounded-full px-4 py-1 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-[10px] font-black tracking-widest italic">
                Terminés
              </Badge>
            </div>
            <h4 className="text-4xl font-black tracking-tighter mb-1">
              {completedOrders}
            </h4>
            <p className="text-sm font-medium text-muted-foreground italic mb-6">
              Ventes finalisées
            </p>
            <div className="w-full bg-muted/30 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${numOrders > 0 ? (completedOrders / numOrders) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Internal Badge for the component
function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <div
      className={cn(
        "px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
