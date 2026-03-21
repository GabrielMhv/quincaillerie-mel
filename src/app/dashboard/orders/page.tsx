import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderStatusUpdater } from "@/components/orders/order-status-updater";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, History, ShoppingCart, User, Globe } from "lucide-react";

export default async function OrdersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, boutique_id")
    .eq("id", user.id)
    .single();

  const isGlobalScope = profile?.role === "admin" && !boutiqueSwitcherId;
  const filteredBoutiqueId = !isGlobalScope ? (boutiqueSwitcherId || profile?.boutique_id) : null;

  let query = supabase
    .from("orders")
    .select(`
      *,
      boutique:boutiques(name),
      employee:users!orders_employee_id_fkey(name),
      handler:users!orders_handler_id_fkey(name),
      order_items(count)
    `)
    .order("created_at", { ascending: false });

  if (filteredBoutiqueId) {
    query = query.eq("boutique_id", filteredBoutiqueId);
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
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Historique des <span className="text-gradient leading-relaxed">Commandes</span>
          </h1>
          <div className="flex items-center gap-3">
             <p className="text-lg text-muted-foreground font-medium italic">
               {isGlobalScope 
                 ? "Gérez et consultez les ventes de tous les magasins." 
                 : `Consultation des ventes : ${currentBoutiqueName}`}
             </p>
             {boutiqueSwitcherId && (
               <Badge 
                 variant="outline" 
                 className="bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1 rounded-full font-black text-[10px] tracking-widest"
               >
                 Mode Boutique
               </Badge>
             )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="p-4 rounded-3xl bg-card border border-border/50 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest">Volume Total</p>
                 <p className="text-xl font-black">{orders?.length || 0}</p>
              </div>
           </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="rounded-[3rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-8 border-b border-border/50 bg-muted/30 flex justify-between items-center">
           <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
             <History className="h-4 w-4" /> Journal des Transactions
           </h3>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground/40 tracking-widest italic border-b border-border/30 h-16 bg-muted/10">
                <th className="px-8 text-left">Commande</th>
                <th className="px-8 text-left">Client</th>
                <th className="px-8 text-left">Provenance</th>
                {isGlobalScope && <th className="px-8 text-left">Point de vente</th>}
                <th className="px-8 text-left">Montant</th>
                <th className="px-8 text-left">Statut</th>
                <th className="px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {orders?.map((order) => (
                <tr 
                  key={order.id} 
                  className="group hover:bg-primary/[0.02] transition-colors h-24"
                >
                  <td className="px-8">
                    <div className="flex flex-col">
                      <span className="font-black text-primary font-mono text-xs tracking-tighter">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black">
                          {order.client_name?.slice(0, 2)}
                       </div>
                       <span className="font-bold whitespace-nowrap">{order.client_name}</span>
                    </div>
                  </td>
                  <td className="px-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black tracking-widest text-muted-foreground/80">
                        {order.source === "passage_boutique" ? "Vente Directe" : 
                         order.source === "employe" ? "Par Employé" :
                         order.source === "site_web" ? "Site Web" :
                         order.source?.replace("_", " ")}
                      </span>
                      {order.employee?.name && (
                        <span className="text-[10px] font-bold text-muted-foreground italic flex items-center gap-1">
                          <User className="h-2.5 w-2.5" /> {order.employee.name}
                        </span>
                      )}
                    </div>
                  </td>
                  {isGlobalScope && (
                    <td className="px-8">
                       <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3 text-muted-foreground/40" />
                          <span className="font-bold text-muted-foreground">{order.boutique?.name}</span>
                       </div>
                    </td>
                  )}
                  <td className="px-8">
                     <span className="text-lg font-black text-foreground tabular-nums">
                       {formatCurrency(order.total)}
                     </span>
                  </td>
                  <td className="px-8">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black tracking-widest border-2 transition-all duration-500",
                        order.status === "completed" 
                          ? "bg-green-500/10 text-green-600 border-green-500/20 shadow-[0_0_15px_-5px_rgba(34,197,94,0.4)]" 
                          : order.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}
                    >
                      {order.status === "completed" ? "Validé" : order.status === "pending" ? "Attente" : "Annulé"}
                    </Badge>
                  </td>
                  <td className="px-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/order-success?id=${order.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
                          <FileText className="h-5 w-5" />
                        </Button>
                      </Link>
                      {(profile?.role === "admin" || profile?.role === "manager" || profile?.role === "employee") && (
                        <OrderStatusUpdater 
                          orderId={order.id} 
                          currentStatus={order.status} 
                          handlerId={order.handler_id}
                          handlerName={order.handler?.name}
                          currentUserId={user.id}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr className="h-64">
                  <td colSpan={isGlobalScope ? 7 : 6} className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                       <History className="h-12 w-12" />
                       <p className="text-sm font-black tracking-widest">Aucune commande enregistrée</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
