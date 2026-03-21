import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Sparkles,
  Search,
  Plus
} from "lucide-react";
import { TransferActions } from "@/components/stocks/transfer-actions";
import { TransferItemsModal } from "@/components/stocks/transfer-items-modal";
import { formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TransfersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, boutique_id")
    .eq("id", user.id)
    .single();

  const isGlobal = profile?.role === "admin";
  const boutiqueId = profile?.boutique_id;

  // Let's fetch transfers
  let query = supabase
    .from("stock_transfers")
    .select(`
      *,
      from_boutique:boutiques!stock_transfers_from_boutique_id_fkey(name),
      to_boutique:boutiques!stock_transfers_to_boutique_id_fkey(name),
      creator:users!stock_transfers_created_by_fkey(name),
      items_count:stock_transfer_items(count)
    `)
    .order("created_at", { ascending: false });

  if (!isGlobal && boutiqueId) {
    query = query.or(`from_boutique_id.eq.${boutiqueId},to_boutique_id.eq.${boutiqueId}`);
  }

  const { data: transfers } = await query;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": 
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 rounded-full px-4 py-1 text-[10px] font-black tracking-widest gap-1.5 animation-pulse"><Clock className="h-3 w-3" /> En attente</Badge>;
      case "accepted": 
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 rounded-full px-4 py-1 text-[10px] font-black tracking-widest gap-1.5"><CheckCircle2 className="h-3 w-3" /> Accepté</Badge>;
      case "shipped": 
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full px-4 py-1 text-[10px] font-black tracking-widest gap-1.5 animate-pulse"><Truck className="h-3 w-3" /> Expédié</Badge>;
      case "completed": 
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-4 py-1 text-[10px] font-black tracking-widest gap-1.5"><CheckCircle2 className="h-3 w-3" /> Terminé</Badge>;
      case "rejected": 
        return <Badge variant="destructive" className="rounded-full px-4 py-1 text-[10px] font-black tracking-widest gap-1.5"><XCircle className="h-3 w-3" /> Refusé</Badge>;
      case "cancelled": 
        return <Badge variant="outline" className="text-muted-foreground/60 border-muted-foreground/20 rounded-full px-4 py-1 text-[10px] font-black tracking-widest gap-1.5"><XCircle className="h-3 w-3" /> Annulé</Badge>;
      default: 
        return <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black tracking-widest">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
             Logistique <span className="text-gradient leading-relaxed">Inter-Boutiques</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium italic">
            Gérez les flux et transferts de marchandises au sein du réseau
          </p>
        </div>
        
        {boutiqueId && (
          <Link href="/dashboard/stocks/request">
            <Button className="h-16 px-10 rounded-[2rem] bg-primary text-primary-foreground font-black tracking-tighter text-lg hover:scale-105 transition-all shadow-lg flex gap-3">
              <Plus className="h-6 w-6" /> Nouveau Transfert
            </Button>
          </Link>
        )}
      </section>

      {/* Main Content Area */}
      <section className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-10 border-b border-border/50 bg-muted/30 flex justify-between items-center">
           <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
             <ArrowRightLeft className="h-4 w-4" /> Journal des Mouvements
           </h3>
           <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black tracking-widest text-primary italic">Maillage Actif</span>
           </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
                  <thead className="h-16 border-b border-border/50 bg-muted/30">
                    <tr className="text-[10px] font-black text-muted-foreground/40 tracking-widest italic">
                      <th className="px-6 text-left w-12">Réf</th>
                      <th className="px-6 text-left">Expéditeur</th>
                      <th className="px-6 text-center">Articles</th>
                      <th className="px-6 text-center">Statut</th>
                      <th className="px-6 text-right">Date</th>
                      <th className="px-6 text-right">Actions</th>
                    </tr>
                  </thead>
            <tbody className="divide-y divide-border/20">
              {transfers?.map((tx) => {
                const isIncoming = tx.from_boutique_id === boutiqueId;
                const isOutgoing = tx.to_boutique_id === boutiqueId;

                return (
                  <tr key={tx.id} className="group hover:bg-primary/[0.02] transition-all h-28">
                    <td className="px-10">
                      <div className="flex flex-col">
                        {isIncoming ? (
                          <div className="flex items-center gap-2 text-rose-600 font-black tracking-tighter italic text-base">
                            <ArrowUpRight className="h-5 w-5" /> Flux Sortant
                          </div>
                        ) : isOutgoing ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-black tracking-tighter italic text-base">
                            <ArrowDownLeft className="h-5 w-5" /> Flux Entrant
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground/60 font-black tracking-tighter italic text-base">
                            <ArrowRightLeft className="h-5 w-5" /> Transfert Réseau
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground/40 mt-1">{formatDate(tx.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-10">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Truck className="h-5 w-5" />
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-lg font-black tracking-tighter">{tx.items_count[0]?.count || 0}</span>
                           <span className="text-[10px] font-bold text-muted-foreground/60 tracking-widest">ARTICLES</span>
                           <TransferItemsModal transferId={tx.id} />
                         </div>
                      </div>
                    </td>
                    <td className="px-10">
                       <div className="flex flex-col">
                         <span className="font-black text-base tracking-tighter">{tx.from_boutique?.name}</span>
                         <span className="text-[10px] font-bold text-muted-foreground/40 italic">Point d&apos;Origine</span>
                       </div>
                    </td>
                    <td className="px-10">
                       <div className="flex flex-col">
                         <span className="font-black text-base tracking-tighter">{tx.to_boutique?.name}</span>
                         <span className="text-[10px] font-bold text-muted-foreground/40 italic">Destination Cible</span>
                       </div>
                    </td>
                    <td className="px-10">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-10 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                        {(profile?.role === "admin" || isGlobal || isIncoming || isOutgoing) && (
                          <TransferActions 
                            transferId={tx.id} 
                            status={tx.status} 
                            isSender={isIncoming} 
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!transfers || transfers.length === 0) && (
                <tr className="h-80">
                  <td colSpan={6} className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-5 opacity-20">
                       <Truck className="h-16 w-16" />
                       <p className="text-lg font-black tracking-widest italic">Aucun mouvement logistique répertorié</p>
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
