import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Users,
  Search,
  TrendingUp,
  Sparkles,
  UserCircle,
  Phone,
  MapPin,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    const key = o.phone || o.client_name;
    if (!key) return;
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
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Gestion des{" "}
            <span className="text-gradient leading-relaxed">Clients</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Liste et analyse de la valeur de vos clients
          </p>
        </div>
      </section>

      {/* Main List Area */}
      <section className="rounded-[4rem] border border-border/50 bg-card/40 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-10 border-b border-border/50 bg-muted/20">
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-all" />
            <input
              placeholder="Rechercher par nom ou téléphone..."
              className="w-full h-14 pl-14 pr-6 bg-background rounded-2xl border-none font-bold text-sm focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-16 bg-muted/10">
                <th className="px-10 text-left">Profil Client</th>
                <th className="px-10 text-left">Contact & Localité</th>
                <th className="px-10 text-center">Fidélité</th>
                <th className="px-10 text-right">Dépenses Totales</th>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {clients.map((c, i) => (
                <TableRow
                  key={i}
                  className="group hover:bg-primary/2 transition-colors h-28 border-none"
                >
                  <TableCell className="px-10">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-secondary/80 flex items-center justify-center text-primary border-2 border-background shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <UserCircle className="h-8 w-8 opacity-40" />
                      </div>
                      <div>
                        <p className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                          {c.name}
                        </p>
                        <p className="text-[10px] font-black text-muted-foreground/40 tracking-widest italic">
                          Client Régulier
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-10">
                    <div className="space-y-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
                        <Phone className="h-3.5 w-3.5 text-primary/40" />{" "}
                        {c.phone}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium italic">
                        <MapPin className="h-3.5 w-3.5 text-primary/40" />{" "}
                        {c.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Badge
                        variant="outline"
                        className="rounded-full px-4 py-1.5 flex items-center gap-2 bg-indigo-500/5 text-indigo-500 border-indigo-500/10 font-black text-[10px] tracking-widest leading-none"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> {c.orderCount}{" "}
                        Commandes
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-10 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black tracking-tighter group-hover:text-primary transition-all">
                        {formatCurrency(c.totalSpent)}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500/60 italic lowercase mt-1">
                        <TrendingUp className="h-3 w-3" /> Croissance Positive
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow className="h-80">
                  <TableCell colSpan={4} className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-5 opacity-20">
                      <Users className="h-16 w-16" />
                      <p className="text-lg font-black tracking-widest italic">
                        Aucun client répertorié
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
