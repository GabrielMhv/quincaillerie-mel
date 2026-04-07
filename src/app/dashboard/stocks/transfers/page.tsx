import { createClient } from "@/lib/supabase/server";
import {
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Sparkles,
  Plus,
} from "lucide-react";
import { TransferActions } from "@/components/stocks/transfer-actions";
import { TransferItemsModal } from "@/components/stocks/transfer-items-modal";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TransfersPage() {
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

  const isGlobal = profile?.role === "admin";
  const boutiqueId = profile?.boutique_id;

  // Let's fetch transfers
  let query = supabase
    .from("stock_transfers")
    .select(
      `
      *,
      from_boutique:boutiques!stock_transfers_from_boutique_id_fkey(name),
      to_boutique:boutiques!stock_transfers_to_boutique_id_fkey(name),
      creator:users!stock_transfers_created_by_fkey(name),
      items_count:stock_transfer_items(count)
    `,
    )
    .order("created_at", { ascending: false });

  if (!isGlobal && boutiqueId) {
    query = query.or(
      `from_boutique_id.eq.${boutiqueId},to_boutique_id.eq.${boutiqueId}`,
    );
  }

  const { data: transfers } = await query;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 font-black text-[10px] tracking-widest">
            <Clock className="h-3 w-3" /> En attente
          </div>
        );
      case "accepted":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 font-black text-[10px] tracking-widest">
            <CheckCircle2 className="h-3 w-3" /> Accepté
          </div>
        );
      case "shipped":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 font-black text-[10px] tracking-widest  animate-pulse">
            <Truck className="h-3 w-3" /> Expédié
          </div>
        );
      case "completed":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 font-black text-[10px] tracking-widest">
            <CheckCircle2 className="h-3 w-3" /> Terminé
          </div>
        );
      case "rejected":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 font-black text-[10px] tracking-widest">
            <XCircle className="h-3 w-3" /> Refusé
          </div>
        );
      case "cancelled":
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 font-black text-[10px] tracking-widest  opacity-60">
            <XCircle className="h-3 w-3" /> Annulé
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] tracking-widest">
            {status}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-350 mx-auto p-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
          <ArrowRightLeft className="h-64 w-64 text-slate-900 dark:text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-slate-500">
                Logistique Réseau
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Transferts{" "}
              <span className="text-blue-600 italic underline decoration-blue-500/20 underline-offset-8">
                Inter-Boutiques
              </span>
            </h1>

            <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
              Gérez les flux de marchandises et optimisez vos stocks à travers
              toutes vos implantations.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {boutiqueId && (
              <Link href="/dashboard/stocks/request">
                <Button className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black tracking-tight text-sm hover:scale-105 transition-all shadow-xl flex gap-3 border-none">
                  <Plus className="h-5 w-5" /> Nouvelle Demande
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm text-slate-400">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-wider">
                Journal des Mouvements
              </h3>
              <p className="text-[10px] font-bold text-slate-400  tracking-widest leading-none mt-1">
                {transfers?.length || 0} transferts répertoriés
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Sparkles className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400">
              Maillage Actif
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 tracking-widest border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-8 py-5 text-left font-black">Type de Flux</th>
                <th className="px-8 py-5 text-left font-black">
                  Trajet Logistique
                </th>
                <th className="px-8 py-5 text-center font-black">
                  Détails Colis
                </th>
                <th className="px-8 py-5 text-center font-black">
                  Statut Actuel
                </th>
                <th className="px-8 py-5 text-right font-black">
                  Date & Heure
                </th>
                <th className="px-8 py-5 text-right font-black">Gestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {transfers?.map((tx) => {
                const isIncoming = tx.to_boutique_id === boutiqueId;
                const isOutgoing = tx.from_boutique_id === boutiqueId;

                return (
                  <tr
                    key={tx.id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300"
                  >
                    <td className="px-8 py-8 border-slate-50 dark:border-slate-800">
                      <div className="flex flex-col gap-1">
                        {isIncoming ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 w-fit">
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black tracking-widest">
                              Flux Entrant
                            </span>
                          </div>
                        ) : isOutgoing ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 w-fit">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black tracking-widest">
                              Flux Sortant
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 border border-slate-100 dark:border-slate-700 w-fit">
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black tracking-widest">
                              Global
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 pl-1">
                          Ref: TX-{tx.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-400 tracking-wider">
                            De
                          </span>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                            {tx.from_boutique?.name}
                          </span>
                        </div>
                        <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-400 tracking-wider">
                            À
                          </span>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                            {tx.to_boutique?.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 border-slate-50 dark:border-slate-800 text-center">
                      <TransferItemsModal transferId={tx.id} />
                    </td>
                    <td className="px-8 py-8 border-slate-50 dark:border-slate-800 text-center">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-8 py-8 border-slate-50 dark:border-slate-800 text-right">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                          {formatDate(tx.created_at)}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 tracking-widest mt-0.5">
                          {tx.creator?.name || "Système"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 border-slate-50 dark:border-slate-800 text-right">
                      <div className="flex justify-end gap-2 pr-4">
                        <TransferActions
                          transferId={tx.id}
                          status={tx.status}
                          isSender={boutiqueId === tx.from_boutique_id}
                          isReceiver={boutiqueId === tx.to_boutique_id}
                          isAdmin={isGlobal}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!transfers?.length && (
                <tr>
                  <td colSpan={6} className="py-40 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-5 opacity-30">
                      <div className="h-20 w-20 rounded-4xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Truck className="h-10 w-10 text-slate-400" />
                      </div>
                      <p className="text-sm font-black tracking-[0.2em]">
                        Aucun mouvement logistique
                      </p>
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
