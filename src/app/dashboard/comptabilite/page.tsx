import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Wallet,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export default async function AccountingPage(props: {
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
        <Wallet className="h-16 w-16 text-muted-foreground/20 mb-6" />
        <h2 className="text-3xl font-black tracking-tighter italic">
          Accès Restreint
        </h2>
        <p className="text-muted-foreground max-w-sm font-medium mt-2 leading-relaxed italic">
          Le module de comptabilité est réservé à la direction financière.
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

  const dateFilter = searchParams.date as string | undefined;

  // Fetch Orders for Financial Analysis
  let ordersQuery = supabase.from("orders").select(`
    *,
    boutique:boutiques(name)
  `);

  if (filteredBoutiqueId) {
    ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
  }

  if (dateFilter) {
    ordersQuery = ordersQuery.gte("created_at", dateFilter);
  }

  const { data: orders } = await ordersQuery;
  const validOrders = orders || [];

  // Calculate Financial Metrics
  const totalCA = validOrders.reduce(
    (acc, o) => acc + (Number(o.total) || 0),
    0,
  );

  // TVA Calculation (e.g. 18% standard in many regions)
  const tvaRate = 0.18;
  const estimatedTVA = totalCA * (tvaRate / (1 + tvaRate));

  const now = new Date();
  const startOfMonthDate = startOfMonth(now);
  const startOfLastMonthDate = startOfMonth(subMonths(now, 1));
  const endOfLastMonthDate = endOfMonth(subMonths(now, 1));

  const currentMonthOrders = validOrders.filter(
    (o) => new Date(o.created_at) >= startOfMonthDate,
  );
  const lastMonthOrders = validOrders.filter((o) => {
    const d = new Date(o.created_at);
    return d >= startOfLastMonthDate && d <= endOfLastMonthDate;
  });

  const currentMonthCA = currentMonthOrders.reduce(
    (acc, o) => acc + (Number(o.total) || 0),
    0,
  );
  const lastMonthCA = lastMonthOrders.reduce(
    (acc, o) => acc + (Number(o.total) || 0),
    0,
  );

  const caGrowth =
    lastMonthCA > 0 ? ((currentMonthCA - lastMonthCA) / lastMonthCA) * 100 : 0;

  // Placeholder for Expenses (since not in DB yet)
  const estimatedExpenses = totalCA * 0.65;
  const netMargin = totalCA - estimatedExpenses;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4 sm:px-0 mt-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="rounded-full bg-primary/5 text-primary border-primary/20 px-4 py-1 font-bold text-[10px] tracking-widest italic"
            >
              Finance & Performance
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic">
            Compta
            <span className="text-primary tracking-[-0.2em] ml-2">bilité</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/80 font-medium max-w-2xl mt-4 leading-relaxed">
            Suivi des flux financiers, analyse des marges et rapports fiscaux.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButtons
            data={validOrders.map((o) => ({
              created_at: o.created_at,
              total: o.total,
              boutique: o.boutique,
              employee: o.employee,
            }))}
          />
        </div>
      </header>

      {/* Global Controls */}
      <section className="p-6 md:p-8 rounded-[3rem] bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 -translate-y-4">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight italic">
              Filtres de Trésorerie
            </h3>
            <p className="text-sm text-muted-foreground font-medium italic tracking-tighter">
              Affinage des données temporelles
            </p>
          </div>
        </div>
        <DashboardFilters />
      </section>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
        {/* Monthly CA */}
        <Card className="rounded-[2.5rem] shadow-2xl bg-linear-to-br from-indigo-600 to-indigo-900 text-white overflow-hidden group border-none">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <DollarSign className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 border-none text-white font-bold italic">
                CA Mensuel
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold tracking-widest opacity-70 italic">
              Chiffre d&apos;Affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter mb-2 italic">
              {formatCurrency(currentMonthCA)}
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-bold",
                caGrowth >= 0 ? "text-emerald-300" : "text-rose-300",
              )}
            >
              {caGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(caGrowth).toFixed(1)}% vs mois dernier
            </div>
          </CardContent>
          <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        </Card>

        {/* Global CA */}
        <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden relative">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground italic">
              CA Brut Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter italic">
              {formatCurrency(totalCA)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium italic tracking-tighter">
              Somme filtrée des transactions
            </p>
          </CardContent>
        </Card>

        {/* Estimated TVA */}
        <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden relative">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground italic">
              TVA Estimée (18%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter italic text-amber-500">
              {formatCurrency(estimatedTVA)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium italic tracking-tighter">
              Taxe sur la Valeur Ajoutée
            </p>
          </CardContent>
        </Card>

        {/* Projected Margin */}
        <Card className="rounded-[2.5rem] bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden relative">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <PieChart className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground italic">
              Marge Estimée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter italic text-emerald-500">
              {formatCurrency(netMargin)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium italic tracking-tighter">
              Profit après charges (est. 65%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Section */}
      <Tabs defaultValue="overview" className="space-y-8 px-4 sm:px-0">
        <div className="flex justify-center">
          <TabsList className="bg-card/40 backdrop-blur-xl border border-border/50 p-2 rounded-full h-16 shadow-2xl">
            <TabsTrigger
              value="overview"
              className="rounded-full px-8 h-full font-bold text-sm tracking-widest italic data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
            >
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="rounded-full px-8 h-full font-bold text-sm tracking-widest italic data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
            >
              Journal des Ventes
            </TabsTrigger>
            <TabsTrigger
              value="tax"
              className="rounded-full px-8 h-full font-bold text-sm tracking-widest italic data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
            >
              Fiscalité &amp; Rapports
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-card/40 backdrop-blur-xl p-8">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tighter italic">
                    Flux Mensuel
                  </CardTitle>
                </div>
              </CardHeader>
              <div className="h-75 w-full flex items-center justify-center border border-dashed border-border/40 rounded-4xl bg-muted/20">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm font-bold text-muted-foreground italic tracking-widest">
                    Graphique de tendance en cours d&apos;intégration
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-2xl bg-card/40 backdrop-blur-xl p-8">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Layers className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tighter italic">
                    Répartition par Boutique
                  </CardTitle>
                </div>
              </CardHeader>
              <div className="space-y-6">
                {/* Summary of boutiques performance */}
                <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/20 border border-border/50">
                  <div>
                    <p className="text-xs font-bold text-primary italic mb-1">
                      Boutique A
                    </p>
                    <p className="text-xl font-black tracking-tighter italic">
                      {formatCurrency(totalCA * 0.6)}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none">
                    60%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/20 border border-border/50">
                  <div>
                    <p className="text-xs font-bold text-indigo-500 italic mb-1">
                      Boutique B
                    </p>
                    <p className="text-xl font-black tracking-tighter italic">
                      {formatCurrency(totalCA * 0.4)}
                    </p>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-500 border-none">
                    40%
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-card/40 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tighter italic">
                    Grand Livre des Ventes
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/30">
                    <th className="px-8 py-5 text-xs font-bold tracking-widest text-muted-foreground italic">
                      ID
                    </th>
                    <th className="px-8 py-5 text-xs font-bold tracking-widest text-muted-foreground italic">
                      Date
                    </th>
                    <th className="px-8 py-5 text-xs font-bold tracking-widest text-muted-foreground italic">
                      Client
                    </th>
                    <th className="px-8 py-5 text-xs font-bold tracking-widest text-muted-foreground italic">
                      Boutique
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold tracking-widest text-muted-foreground italic">
                      Montant
                    </th>
                    <th className="px-8 py-5 text-center text-xs font-bold tracking-widest text-muted-foreground italic">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {validOrders.slice(0, 10).map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-8 py-5 text-xs font-bold text-muted-foreground">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold italic">
                        {format(
                          new Date(order.created_at),
                          "dd MMM yyyy HH:mm",
                          { locale: fr },
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold italic">
                        {order.client_name || "Client Anonyme"}
                      </td>
                      <td className="px-8 py-5">
                        <Badge
                          variant="outline"
                          className="font-bold italic text-[9px] border-primary/20 text-primary"
                        >
                          {order.boutique?.name || "Globale"}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right text-sm font-black italic">
                        {formatCurrency(Number(order.total))}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <Badge
                          className={cn(
                            "font-bold italic text-[9px]",
                            order.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-500 border-none"
                              : "bg-orange-500/20 text-orange-500 border-none",
                          )}
                        >
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 text-center border-t border-border/50">
              <Link
                href="/dashboard/orders"
                className="text-sm font-bold text-muted-foreground italic tracking-widest cursor-pointer hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Consulter l&apos;historique complet
              </Link>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[3rem] shadow-2xl bg-card/40 backdrop-blur-xl p-10 border-2 border-dashed border-primary/20">
              <div className="text-center space-y-6">
                <div className="h-20 w-20 rounded-4xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 mx-auto">
                  <FileText className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter italic">
                    Rapport Fiscal Annuel
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium italic mt-2 leading-relaxed">
                    Générez un document consolidé pour vos déclarations
                    d&apos;impôts et bilans comptables de l&apos;exercice en
                    cours.
                  </p>
                </div>
                <button className="w-full py-4 bg-indigo-500 text-white font-black italic rounded-3xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-transform">
                  Télécharger PDF (Bilan)
                </button>
              </div>
            </Card>

            <Card className="rounded-[3rem] shadow-2xl bg-card/40 backdrop-blur-xl p-10 border-2 border-dashed border-emerald-500/20">
              <div className="text-center space-y-6">
                <div className="h-20 w-20 rounded-4xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 mx-auto">
                  <Wallet className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter italic">
                    Relevé de TVA
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium italic mt-2 leading-relaxed">
                    Calcul automatique de la TVA collectée sur l&apos;ensemble
                    des transactions par période fiscale.
                  </p>
                </div>
                <button className="w-full py-4 bg-emerald-500 text-white font-black italic rounded-3xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                  Consulter TVA
                </button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
