import { createClient } from "@/lib/supabase/server";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Award,
  Star,
  Zap,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

  let query = supabase
    .from("orders")
    .select("total, created_at, boutique_id, items, client_name")
    .order("created_at", { ascending: false });

  if (boutiqueSwitcherId) {
    query = query.eq("boutique_id", boutiqueSwitcherId);
  }

  const { data: orders } = await query;
  const totalRevenue =
    orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
  const orderCount = orders?.length || 0;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const clientsMap: Record<
    string,
    { total: number; count: number; name: string }
  > = {};
  orders?.forEach((o) => {
    if (o.client_name) {
      if (!clientsMap[o.client_name]) {
        clientsMap[o.client_name] = { total: 0, count: 0, name: o.client_name };
      }
      clientsMap[o.client_name].total += Number(o.total);
      clientsMap[o.client_name].count += 1;
    }
  });

  const topClients = Object.values(clientsMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-2 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden group border border-white/10">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
          <TrendingUp className="h-64 w-64 rotate-12" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium backdrop-blur-md">
            <Zap className="h-4 w-4 fill-blue-400" />
            <span>Analyses en temps rÃ©el</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Performances <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Commerciales
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
            Suivez l&apos;évolution de vos ventes, identifiez vos meilleurs clients
            et optimisez votre stratégie de croissance.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        <StatCard
          title="Chiffre d'Affaires"
          value={formatCurrency(totalRevenue)}
          subValue="+12.5% vs mois dernier"
          icon={<TrendingUp className="h-8 w-8 text-emerald-400" />}
          trend="up"
        />
        <StatCard
          title="Commandes"
          value={orderCount.toString()}
          subValue="Sur la période sélectionnée"
          icon={<ShoppingCart className="h-8 w-8 text-blue-400" />}
          trend="up"
        />
        <StatCard
          title="Panier Moyen"
          value={formatCurrency(avgOrderValue)}
          subValue="Optimisation stable"
          icon={<Star className="h-8 w-8 text-amber-400" />}
          trend="neutral"
        />
        <StatCard
          title="Taux Retention"
          value="78%"
          subValue="Fidélité client accrue"
          icon={<Users className="h-8 w-8 text-purple-400" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                  <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                Meilleurs Clients
              </h2>
              <button className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline">
                Voir tout <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {topClients.map((client, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-lg text-slate-400 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">
                        {client.name}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {client.count} commandes passées
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-white text-xl">
                      {formatCurrency(client.total)}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold justify-end">
                      <TrendingUp className="h-3 w-3" />
                      TOP CLIENT
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm h-fit">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            Dernière Activité
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start relative pb-6 border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-6">
              <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Objectif mensuel atteint
                </p>
                <p className="text-xs text-slate-500 mt-1">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex gap-4 items-start relative pb-6 border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-6">
              <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Nouveau record de vente quotidienne
                </p>
                <p className="text-xs text-slate-500 mt-1">Hier, 18:45</p>
              </div>
            </div>
            <div className="flex gap-4 items-start relative ml-3 pl-6">
              <div className="absolute -left-[11px] top-0 h-5 w-5 rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Analyse des stocks complétée
                </p>
                <p className="text-xs text-slate-500 mt-1">Il y a 2 jours</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-10 py-5 rounded-[2rem] bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
            Télécharger le rapport complet
            <Download className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

function StatCard({ title, value, subValue, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-bold ${
            trend === "up"
              ? "text-emerald-500"
              : trend === "down"
                ? "text-rose-500"
                : "text-slate-400"
          }`}
        >
          {trend === "up" && <ArrowUpRight className="h-4 w-4" />}
          {trend === "down" && <ArrowDownRight className="h-4 w-4" />}
          {trend === "up" ? "12%" : trend === "down" ? "5%" : "-"}
        </div>
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">
          {title}
        </p>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </p>
        <p className="text-xs text-slate-400 font-medium mt-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="h-3 w-3" />
          {subValue}
        </p>
      </div>
    </div>
  );
}
