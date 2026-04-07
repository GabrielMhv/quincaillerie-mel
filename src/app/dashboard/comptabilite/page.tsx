import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  FileText,
  Wallet,
  CreditCard,
  Receipt,
  PiggyBank,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
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
import { Badge } from "@/components/ui/badge";

export default async function ComptabilitePage(props: {
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

  if (profile?.role === "employee") {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-center space-y-4">
        <h1 className="text-3xl font-black tracking-tighter">
          Accès Restreint
        </h1>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à la
          comptabilité.
        </p>
      </div>
    );
  }

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
  let ordersQuery = supabase
    .from("orders")
    .select(
      `
    *,
    boutique:boutiques(name),
    employee:users!orders_employee_id_fkey(name)
  `,
    )
    .order("created_at", { ascending: false });

  if (filteredBoutiqueId)
    ordersQuery = ordersQuery.eq("boutique_id", filteredBoutiqueId);
  if (dateFilter) ordersQuery = ordersQuery.gte("created_at", dateFilter);

  const { data: orders } = await ordersQuery;
  const validOrders = orders || [];

  const totalRevenue = validOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalTaxes = totalRevenue * 0.18; // Suppose 18% TVA for example
  const netRevenue = totalRevenue - totalTaxes;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Journal des{" "}
            <span className="text-gradient leading-relaxed">Écritures</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Gestion financière et rapports de transactions
          </p>
        </div>
        <DashboardFilters />
      </section>

      {/* Financial Summary KPIs */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="p-10 rounded-[3rem] bg-emerald-600 shadow-2xl shadow-emerald-600/20 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 h-32 w-32 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-white border border-white/20">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-emerald-100/70 tracking-tight">
                CA Global (TTC)
              </h3>
              <p className="text-4xl font-black text-white tracking-tighter">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-orange-500 shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 h-32 w-32 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-white border border-white/20">
              <Receipt className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-orange-100/70 tracking-tight">
                TVA Collectée (18%)
              </h3>
              <p className="text-4xl font-black text-white tracking-tighter">
                {formatCurrency(totalTaxes)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-10 rounded-[3rem] bg-indigo-600 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 h-32 w-32 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-white border border-white/20">
              <PiggyBank className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-[11px] font-bold text-indigo-100/70 tracking-tight">
                Net Hors Taxes (HT)
              </h3>
              <p className="text-4xl font-black text-white tracking-tighter">
                {formatCurrency(netRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[4rem] border border-border/50 bg-card/40 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-10 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black tracking-tighter">
              Grand Livre des Ventes{" "}
              <span className="text-muted-foreground/40 text-sm ml-2">
                ({validOrders.length} transactions)
              </span>
            </h3>
          </div>
          <ExportButtons data={validOrders} />
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/30 h-20 bg-muted/10 opacity-60">
                <TableHead className="px-10 text-[10px] font-black tracking-[0.2em]">
                  Date de Valeur
                </TableHead>
                <TableHead className="px-10 text-[10px] font-black tracking-[0.2em]">
                  Boutique
                </TableHead>
                <TableHead className="px-10 text-[10px] font-black tracking-[0.2em]">
                  Agent Émetteur
                </TableHead>
                <TableHead className="px-10 text-[10px] font-black tracking-[0.2em]">
                  État du Flux
                </TableHead>
                <TableHead className="px-10 text-right text-[10px] font-black tracking-[0.2em]">
                  Débit TTC
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {validOrders.map((o) => (
                <TableRow
                  key={o.id}
                  className="h-24 hover:bg-primary/2 transition-colors border-none group"
                >
                  <TableCell className="px-10">
                    <span className="text-sm font-bold tracking-tight opacity-70">
                      {format(new Date(o.created_at), "d MMMM yyyy 'à' HH:mm", {
                        locale: fr,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="px-10">
                    <Badge
                      variant="outline"
                      className="rounded-xl px-4 py-1.5 bg-primary/5 text-primary border-primary/10 text-[10px] font-black tracking-widest leading-none"
                    >
                      {o.boutique?.name || "Réseau"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black text-primary">
                        {o.employee?.name?.substring(0, 2).to()}
                      </div>
                      <span className="text-sm font-black tracking-tight">
                        {o.employee?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-10">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black tracking-widest">
                        Encaissé
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <span className="text-lg font-black tracking-tight group-hover:text-primary transition-all">
                      {formatCurrency(Number(o.total))}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {validOrders.length === 0 && (
          <div className="py-24 text-center space-y-6">
            <div className="h-20 w-20 rounded-4xl bg-rose-500/10 flex items-center justify-center text-rose-600 mx-auto">
              <TrendingUp className="h-10 w-10 rotate-180" />
            </div>
            <p className="text-xl font-bold tracking-tight">
              Aucune transaction trouvée sur cette période
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
