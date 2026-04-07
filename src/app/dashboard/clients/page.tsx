import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Search,
  TrendingUp,
  UserCircle,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClientsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query = (searchParams.query as string) || "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch all orders to build client profiles
  const { data: orders } = await supabase
    .from("orders")
    .select("client_name, phone, address, total, created_at")
    .order("created_at", { ascending: false });

  const clientsMap: Record<
    string,
    {
      name: string;
      phone: string;
      address: string;
      totalSpent: number;
      orderCount: number;
      lastOrder: string;
    }
  > = {};

  orders?.forEach((o) => {
    const key = (o.phone || o.client_name || "Anonyme").trim().toLowerCase();
    if (!clientsMap[key]) {
      clientsMap[key] = {
        name: o.client_name || "Anonyme",
        phone: o.phone || "N/A",
        address: o.address || "Non spécifiée",
        totalSpent: 0,
        orderCount: 0,
        lastOrder: o.created_at,
      };
    }
    clientsMap[key].totalSpent += Number(o.total);
    clientsMap[key].orderCount += 1;
  });

  const clients = Object.values(clientsMap)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query),
    )
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="mx-auto max-w-350 space-y-8 p-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
          <Users className="h-64 w-64 text-slate-900 dark:text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-slate-500">
                CRM & Fidélité
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestion des{" "}
              <span className="text-blue-600 italic underline decoration-blue-500/20 underline-offset-8">
                Clients
              </span>
            </h1>

            <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
              Analysez la valeur de vos clients et gérez vos relations
              commerciales efficacement.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">
                Total Clients
              </p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {clients.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main List Area */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <form className="relative group w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              name="query"
              defaultValue={query}
              placeholder="Rechercher par nom ou téléphone..."
              className="w-full h-12 pl-12 pr-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all shadow-sm"
            />
          </form>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Sparkles className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 ">
              Top 10% Clients Actifs
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <tr className="text-[10px] font-black text-slate-400 tracking-widest  border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-16">
                <th className="px-10 text-left font-black">Profil Client</th>
                <th className="px-10 text-left font-black">
                  Contact & Localité
                </th>
                <th className="px-10 text-center font-black">Fidélité</th>
                <th className="px-10 text-right font-black">
                  Dépenses Totales
                </th>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50 dark:divide-slate-800">
              {clients.map((c, i) => (
                <TableRow
                  key={i}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300"
                >
                  <TableCell className="px-10 py-8 border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 group-hover:shadow-md transition-all duration-500 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <UserCircle className="h-7 w-7 relative z-10" />
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors  leading-tight">
                          {c.name}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest  mt-1">
                          Ref: CL-{i.toString().padStart(4, "0")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 py-8 border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold text-sm tracking-tight bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 w-fit">
                        <Phone className="h-3.5 w-3.5 text-blue-500" />
                        {c.phone}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400  tracking-tight pl-1">
                        <MapPin className="h-3.5 w-3.5 opacity-50" />
                        {c.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 py-8 border-slate-50 dark:border-slate-800 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">
                            {c.orderCount}
                          </p>
                          <p className="text-[9px] font-black text-slate-400  tracking-widest mt-1">
                            Achats
                          </p>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 py-8 border-slate-50 dark:border-slate-800 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-blue-600 transition-all flex items-center gap-2">
                        {formatCurrency(c.totalSpent)}
                        <ArrowUpRight className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500  tracking-widest mt-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                        <TrendingUp className="h-3 w-3" /> Rentabilité Haute
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-40 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-5 opacity-30">
                      <div className="h-20 w-20 rounded-4xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users className="h-10 w-10 text-slate-400" />
                      </div>
                      <p className="text-sm font-black tracking-[0.2em] ">
                        Aucun client répertorié
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
