"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  Ban,
  MoveRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PrintTransferButton } from "./print-transfer-button";

interface TransferActionsProps {
  transferId: string;
  status: string;
  isSender: boolean;
  isReceiver: boolean;
  isAdmin?: boolean;
}

export function TransferActions({
  transferId,
  status,
  isSender,
  isReceiver,
  isAdmin = false,
}: TransferActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  if (status === "completed") {
    return <PrintTransferButton transferId={transferId} />;
  }

  if (status === "cancelled" || status === "rejected") return null;

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // We no longer handle stock movement here in the frontend.
      // The database trigger public.handle_stock_transfer_completion() deals with it.
      // This prevents double deduction and ensures atomic transactions.

      const { error: updateError } = await supabase
        .from("stock_transfers")
        .update({
          status: newStatus,
          handled_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (updateError) {
        console.error("Supabase Update Error:", updateError);
        throw updateError;
      }

      const labels: Record<string, string> = {
        accepted: "accepté",
        rejected: "refusé",
        shipped: "marqué comme expédié",
        completed: "confirmé comme livré",
        cancelled: "annulé",
      };

      toast.success(`Transfert ${labels[newStatus] || newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      });
    } finally {
      setLoading(null);
    }
  };

  // 1. PENDING: Sender (B) can accept/reject, Receiver (A) can ONLY cancel
  if (status === "pending") {
    // IF ADMIN
    if (isAdmin) {
      return (
        <div className="flex gap-3 justify-end items-center">
          <PrintTransferButton transferId={transferId} />
          <Button
            size="sm"
            variant="ghost"
            className="h-10 px-6 rounded-xl text-rose-600 hover:bg-rose-500/10 font-black tracking-tighter text-xs"
            onClick={() => updateStatus("rejected")}
            disabled={!!loading}
          >
            {loading === "rejected" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Refuser (Admin)
          </Button>
          <Button
            size="sm"
            className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-tighter text-xs shadow-lg shadow-emerald-500/20"
            onClick={() => updateStatus("accepted")}
            disabled={!!loading}
          >
            Accepter (Admin)
          </Button>
        </div>
      );
    }

    // IF SENDER (B - celui qui doit envoyer)
    if (isSender) {
      return (
        <div className="flex gap-3 justify-end items-center">
          <PrintTransferButton transferId={transferId} />
          <Button
            size="sm"
            variant="ghost"
            className="h-10 px-6 rounded-xl text-rose-600 hover:bg-rose-500/10 font-black tracking-tighter text-xs"
            onClick={() => updateStatus("rejected")}
            disabled={!!loading}
          >
            {loading === "rejected" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Refuser
          </Button>
          <Button
            size="sm"
            className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-tighter text-xs shadow-lg shadow-emerald-500/20"
            onClick={() => updateStatus("accepted")}
            disabled={!!loading}
          >
            {loading === "accepted" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Accepter
          </Button>
        </div>
      );
    }

    // IF RECEIVER (A - celui qui a fait la demande)
    if (isReceiver) {
      return (
        <div className="flex gap-3 justify-end items-center">
          <PrintTransferButton transferId={transferId} />
          <Button
            size="sm"
            variant="ghost"
            className="h-10 px-6 rounded-xl text-rose-600 hover:bg-rose-500/10 font-black tracking-tighter text-xs"
            onClick={() => updateStatus("cancelled")}
            disabled={!!loading}
          >
            <Ban className="h-4 w-4 mr-2" /> Annuler ma demande
          </Button>
        </div>
      );
    }

    return (
      <Badge
        variant="outline"
        className="rounded-full bg-slate-500/10 text-slate-500 border-slate-500/20 px-4 py-1.5 text-[10px] font-black tracking-widest italic"
      >
        À Valider
      </Badge>
    );
  }

  // 2. ACCEPTED: Sender marks as SHIPPED
  if (status === "accepted") {
    if (isSender || isAdmin) {
      return (
        <div className="flex gap-3 justify-end items-center">
          <PrintTransferButton transferId={transferId} />
          <Button
            size="sm"
            className="h-10 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black tracking-tighter text-xs shadow-lg shadow-blue-500/20 flex gap-2"
            onClick={() => updateStatus("shipped")}
            disabled={!!loading}
          >
            {loading === "shipped" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoveRight className="h-4 w-4" />
            )}
            Expédier le stock
          </Button>
        </div>
      );
    }
    return (
      <div className="flex gap-3 justify-end items-center">
        <PrintTransferButton transferId={transferId} />
        <Badge
          variant="outline"
          className="rounded-full bg-blue-500/5 text-blue-600 border-blue-500/20 px-4 py-1.5 text-[10px] font-black tracking-widest italic animate-pulse"
        >
          Préparation...
        </Badge>
      </div>
    );
  }

  // 3. SHIPPED: Requester marks as COMPLETED (Received)
  if (status === "shipped") {
    if (isReceiver || isAdmin) {
      return (
        <div className="flex gap-3 justify-end items-center">
          <PrintTransferButton transferId={transferId} />
          <Button
            size="sm"
            className="h-10 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-tighter text-xs shadow-lg shadow-emerald-500/20 flex gap-2"
            onClick={() => updateStatus("completed")}
            disabled={!!loading}
          >
            {loading === "completed" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Confirmer réception
          </Button>
        </div>
      );
    }
    return (
      <div className="flex gap-3 justify-end items-center">
        {(isSender || isReceiver || isAdmin) && (
          <PrintTransferButton transferId={transferId} />
        )}
        <Badge
          variant="outline"
          className="rounded-full bg-orange-500/5 text-orange-600 border-orange-500/20 px-4 py-1.5 text-[10px] font-black tracking-widest italic animate-pulse flex gap-2"
        >
          <Truck className="h-3 w-3" /> En Route...
        </Badge>
      </div>
    );
  }

  return isSender || isReceiver || isAdmin ? (
    <PrintTransferButton transferId={transferId} />
  ) : null;
}
