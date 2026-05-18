import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Users, Search, Phone, MapPin, UserCircle, ShoppingBag, ArrowUpRight, TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { OrdersTableSkeleton } from "@/components/ui/skeleton";
import { ClientsTable } from "@/components/clients/clients-table";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

export default async function ClientsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 animate-in fade-in duration-700">
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 transition-transform pointer-events-none">
          <Users className="h-64 w-64 text-slate-900 dark:text-white" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestion <span className="text-blue-600">Clients</span>
            </h1>
          </div>
        </div>
      </section>
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
        address: o.address || "Non spÃ©cifiÃ©e",
        totalSpent: 0,
        orderCount: 0,
      };
    }
    clientsMap[key].totalSpent += Number(o.total);
    clientsMap[key].orderCount += 1;
  });

  const clients = Object.values(clientsMap);

  return <ClientsTable clients={clients as any} />;
}