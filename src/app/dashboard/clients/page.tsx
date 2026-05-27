import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Users,
  Search,
  Phone,
  MapPin,
  UserCircle,
  ShoppingBag,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Suspense } from "react";
import { OrdersTableSkeleton } from "@/components/ui/skeleton";
import { ClientsTable } from "@/components/clients/clients-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClientsPage() {
  return (
    <div className="max-w-400 mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Répertoire Clients
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Suivez l&apos;activité de vos clients et leur fidélité
          </p>
        </div>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <ClientsContent />
      </Suspense>
    </div>
  );
}

async function ClientsContent() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("client_name, phone, address, total, created_at")
    .order("created_at", { ascending: false });

  const clientsMap: any = {};
  orders?.forEach((o) => {
    const key = o.phone;
    if (!clientsMap[key]) {
      clientsMap[key] = {
        name: o.client_name,
        phone: o.phone,
        address: o.address || "Non spécifiée",
        totalSpent: 0,
        orderCount: 0,
        lastOrder: o.created_at,
      };
    }
    clientsMap[key].totalSpent += Number(o.total);
    clientsMap[key].orderCount += 1;
  });

  const clients = Object.values(clientsMap) as any[];

  // Statistics for the header
  const totalClients = clients.length;
  const totalRevenue = clients.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgOrderValue = totalClients > 0 ? totalRevenue / totalClients : 0;

  return (
    <div className="space-y-8">
      {/* Stats Cards Grid Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Clients",
            value: totalClients,
            color: "text-blue-600 bg-blue-50/50",
            icon: UserCircle,
          },
          {
            label: "Volume d'achat",
            value: formatCurrency(totalRevenue),
            color: "text-emerald-600 bg-emerald-50/50",
            icon: TrendingUp,
          },
          {
            label: "Panier moyen",
            value: formatCurrency(avgOrderValue),
            color: "text-purple-600 bg-purple-50/50",
            icon: ShoppingBag,
          },
          {
            label: "Nouveaux (30j)",
            value: clients.filter(
              (c) =>
                new Date(c.lastOrderDate) >
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            ).length,
            color: "text-amber-600 bg-amber-50/50",
            icon: Users,
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
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
