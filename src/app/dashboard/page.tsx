import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Store as StoreIcon, Clock, User as UserIcon } from "lucide-react";
import { subDays, startOfDay } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { DashboardChartsSection } from "@/components/dashboard/dashboard-charts-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  if (role === "admin" || role === "manager") {
    todayOrders.forEach(() => {
      // Removed team sales tracking as it is not used in the minimal dashboard
    });
  }

  const hoursNow = new Date().getHours();
  const greeting =
    hoursNow < 12 ? "Bonjour" : hoursNow < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4 sm:px-0">
        <div className="flex items-center gap-10">
          <div className="hidden md:block">
            <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-500/10 p-1 flex items-center justify-center border-4 border-white dark:border-white/5 shadow-2xl relative">
              <Avatar className="h-full w-full rounded-[2.4rem]">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-black bg-indigo-500 text-white">
                  {profile?.name?.substring(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-primary tracking-tight mb-1">
                {profile?.role === "admin"
                  ? "Administrateur Système"
                  : profile?.role === "manager"
                    ? "Manager Boutique"
                    : "Poste de Vente"}
              </p>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight animate-in slide-in-from-left duration-700 italic">
                {greeting}, {profile?.name || "Admin"}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground/80 font-medium max-w-2xl leading-relaxed">
              {isGlobalScope
                ? "Heureux de vous revoir. Voici l'état global du réseau."
                : `Aperçu de la boutique ${currentBoutiqueName}.`}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 md:p-8 rounded-4xl bg-card/40 backdrop-blur-xl border border-border/50 shadow-premium">
        <div className="flex items-center gap-4">
          <Clock className="h-5 w-5 text-primary/40" />
          <h2 className="text-xl font-black tracking-tighter italic">
            Période <span className="text-primary">d&apos;Analyse</span>
          </h2>
        </div>
        <DashboardFilters />
      </section>

      {/* Main KPI Grid (Condensed) */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardChartsSection
          filteredBoutiqueId={filteredBoutiqueId}
          dateFilter={dateFilterStart}
          range={range}
        />
      </Suspense>

      {/* Global Access (Only if Admin & Global) */}
      {isGlobalScope && boutiques && boutiques.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black tracking-tighter">
              Accès <span className="text-primary">Boutiques</span>
            </h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      className="group relative overflow-hidden rounded-4xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 outline-none"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <StoreIcon className="h-20 w-20 text-primary" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black tracking-widest text-primary mb-1 uppercase">
                            {b.address}
                          </span>
                          <h4 className="text-2xl font-black tracking-tighter">
                            {b.name}
                          </h4>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase mb-1">
                              Revenu ITD
                            </p>
                            <p className="text-xl font-black">
                              {formatCurrency(bRevenue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase mb-1">
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
    </div>
  );
}
