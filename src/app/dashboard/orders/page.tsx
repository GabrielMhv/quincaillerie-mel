import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Clock, ShoppingBag, History } from "lucide-react";
import { OrdersTable } from "@/components/orders/orders-table";
import { OrderFilters } from "@/components/orders/order-filters";
import { cn } from "@/lib/utils";
import { format, startOfDay } from "date-fns";

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;
  const statusFilter = searchParams.status as string | undefined;

  // Default to today if no date range is provided
  const now = new Date();
  const startDate =
    (searchParams.startDate as string | undefined) ||
    (searchParams.preset
      ? undefined
      : format(startOfDay(now), "yyyy-MM-dd'T'HH:mm:ss"));
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
  if (filteredBoutiqueId) {
    await supabase
      .from("boutiques")
      .select("name")
      .eq("id", filteredBoutiqueId)
      .single();
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Orders fetching error:", error);
  }

  // Calcul des statistiques simples
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === "pending").length || 0,
    completed: orders?.filter((o) => o.status === "completed").length || 0,
  };

  return (
    <div className="max-w-400 mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-700">
      {/* Search Header */}
      <div className="relative group">
        <input
          type="text"
          placeholder="Rechercher des commandes"
          className="w-full h-14 pl-6 pr-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-slate-500 text-sm shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow group-hover:shadow-md"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 hover:rotate-180 transition-transform cursor-pointer">
          <History className="h-5 w-5" />
        </div>
      </div>

      {/* Stats Cards Grid Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total commandes",
            value: stats.total,
            color: "text-blue-600 bg-blue-50/50",
            icon: ShoppingBag,
          },
          {
            label: "En attente",
            value: stats.pending,
            color: "text-amber-600 bg-amber-50/50",
            icon: Clock,
          },
          {
            label: "En préparation",
            value: 0,
            color: "text-purple-600 bg-purple-50/50",
            icon: Clock,
          }, // Placeholder for UI match
          {
            label: "Livré",
            value: stats.completed,
            color: "text-emerald-600 bg-emerald-50/50",
            icon: ShoppingBag,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4"
          >
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm",
                stat.color,
              )}
            >
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <OrderFilters />

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white  tracking-wider">
              Flux d&apos;activité direct
            </h3>
          </div>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-[10px] font-bold  tracking-tighter"
          >
            {orders?.length || 0} résultats
          </Badge>
        </div>

        <OrdersTable
          orders={orders || []}
          isGlobalScope={isGlobalScope}
          currentUserId={user.id}
          userRole={profile?.role || "employee"}
        />
      </div>
    </div>
  );
}
