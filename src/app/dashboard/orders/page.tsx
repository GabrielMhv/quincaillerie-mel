import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderStatusUpdater } from "@/components/orders/order-status-updater";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, History, ShoppingCart, User, Globe, MapPin, Eye } from "lucide-react";
import { OrdersTable } from "@/components/orders/orders-table";

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
      order_items(*, product:products(name, price))
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
