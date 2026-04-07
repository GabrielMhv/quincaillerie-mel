import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { History, ShoppingCart, Filter } from "lucide-react";
import { OrdersTable } from "@/components/orders/orders-table";
import { OrderFilters } from "@/components/orders/order-filters";

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;
  const statusFilter = searchParams.status as string | undefined;
  const startDate = searchParams.startDate as string | undefined;
  const endDate = searchParams.endDate as string | undefined;

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
    ? boutiqueSwitcherId || profile?.boutique_id
    : null;

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      boutique:boutiques(name),
      employee:users!orders_employee_id_fkey(name),
      handler:users!orders_handler_id_fkey(name),
      order_items(*, product:products(name, price))
    `,
    )
    .order("created_at", { ascending: false });

  if (filteredBoutiqueId) {
    query = query.eq("boutique_id", filteredBoutiqueId);
  }

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  // Fetch current boutique name for display if filtered
  let currentBoutiqueName = "";
  if (filteredBoutiqueId) {
    const { data: bData } = await supabase
      .from("boutiques")
      .select("name")
      .eq("id", filteredBoutiqueId)
      .single();
    currentBoutiqueName = bData?.name || "";
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Orders fetching error:", error);
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-row items-center justify-between gap-6 px-10 py-12 rounded-[3.5rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden group shadow-premium">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
          <History className="h-40 w-40 text-indigo-600" />
        </div>
        <div className="space-y-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-2">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-1">
            Ventes & <span className="text-indigo-500 italic">Historique</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-muted-foreground font-medium italic leading-none">
              {isGlobalScope
                ? "Gestion consolidée de toutes les boutiques."
                : `Consultation des ventes : ${currentBoutiqueName}`}
            </p>
            {boutiqueSwitcherId && (
              <Badge
                variant="outline"
                className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase shadow-xs"
              >
                Mode Local
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 px-8 py-4 rounded-3xl bg-secondary/30 backdrop-blur-md border border-border/10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest">
                Volume Total
              </p>
              <p className="text-xl font-black">{orders?.length || 0}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-xl p-8 shadow-premium">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">
              Filtrage Avancé
            </h3>
            <p className="text-xs font-bold text-muted-foreground/60 italic">
              Affinez votre recherche par date et statut
            </p>
          </div>
        </div>
        <OrderFilters />
      </section>

      {/* Main Content Area */}
      <section className="rounded-[3rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-8 border-b border-border/50 bg-muted/30 flex justify-between items-center">
          <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
            <History className="h-4 w-4" /> Journal des Transactions
          </h3>
        </div>

        <OrdersTable
          orders={orders || []}
          isGlobalScope={isGlobalScope}
          currentUserId={user.id}
          userRole={profile?.role || "employee"}
        />
      </section>
    </div>
  );
}
