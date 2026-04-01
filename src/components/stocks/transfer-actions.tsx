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

interface TransferActionsProps {
  transferId: string;
  status: string;
  isSender: boolean; // Am I the boutique B (sender)?
}

export function TransferActions({
  transferId,
  status,
  isSender,
}: TransferActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  if (status === "completed" || status === "cancelled" || status === "rejected")
    return null;

  const updateStatus = async (newStatus: string) => {
    setLoading(newStatus);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Get transfer details
      const { data: transfer, error: fetchError } = await supabase
        .from("stock_transfers")
        .select("*, stock_transfer_items(*)")
        .eq("id", transferId)
        .single();

      if (fetchError) throw fetchError;

      // Handle stock movement
      if (newStatus === "shipped") {
        // Collect all items (from parent and children)
        const itemsToMove = [];
        if (transfer.product_id && transfer.quantity) {
          itemsToMove.push({
            product_id: transfer.product_id,
            quantity: transfer.quantity,
          });
        }
        if (transfer.stock_transfer_items?.length > 0) {
          transfer.stock_transfer_items.forEach(
            (item: { product_id: string; quantity: number }) => {
              itemsToMove.push({
                product_id: item.product_id,
                quantity: item.quantity,
              });
            },
          );
        }

        // Deduct from source
        for (const item of itemsToMove) {
          // Check current stock
          const { data: currentStock } = await supabase
            .from("stocks")
            .select("quantity")
            .eq("product_id", item.product_id)
            .eq("boutique_id", transfer.from_boutique_id)
            .single();

          if (!currentStock || currentStock.quantity < item.quantity) {
            throw new Error(
              `Stock insuffisant pour l'un des produits dans la boutique source.`,
            );
          }

          const { error: deductError } = await supabase
            .from("stocks")
            .update({ quantity: currentStock.quantity - item.quantity })
            .eq("product_id", item.product_id)
            .eq("boutique_id", transfer.from_boutique_id);

          if (deductError) throw deductError;
        }
      }

      if (newStatus === "completed") {
        // Collect all items
        const itemsToMove = [];
        if (transfer.product_id && transfer.quantity) {
          itemsToMove.push({
            product_id: transfer.product_id,
            quantity: transfer.quantity,
          });
        }
        if (transfer.stock_transfer_items?.length > 0) {
          transfer.stock_transfer_items.forEach(
            (item: { product_id: string; quantity: number }) => {
              itemsToMove.push({
                product_id: item.product_id,
                quantity: item.quantity,
              });
            },
          );
        }

        // Add to destination
        for (const item of itemsToMove) {
          const { data: existingStock } = await supabase
            .from("stocks")
            .select("id, quantity")
            .eq("product_id", item.product_id)
            .eq("boutique_id", transfer.to_boutique_id)
            .single();

          if (existingStock) {
            const { error: addError } = await supabase
              .from("stocks")
              .update({ quantity: existingStock.quantity + item.quantity })
              .eq("id", existingStock.id);
            if (addError) throw addError;
          } else {
            const { error: insertError } = await supabase
              .from("stocks")
              .insert({
                product_id: item.product_id,
                boutique_id: transfer.to_boutique_id,
                quantity: item.quantity,
              });
            if (insertError) throw insertError;
          }
        }
      }

      const { error: updateError } = await supabase
        .from("stock_transfers")
        .update({
          status: newStatus,
          handled_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (updateError) throw updateError;

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

  // 1. PENDING: Sender can accept/reject, Requester can cancel
  if (status === "pending") {
    if (isSender) {
      return (
        <div className="flex gap-3 justify-end">
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
    return (
      <Button
        size="sm"
        variant="ghost"
        className="h-10 px-6 rounded-xl text-rose-600 hover:bg-rose-500/10 font-black tracking-tighter text-xs"
        onClick={() => updateStatus("cancelled")}
        disabled={!!loading}
      >
        <Ban className="h-4 w-4 mr-2" /> Annuler
      </Button>
    );
  }

  // 2. ACCEPTED: Sender marks as SHIPPED
  if (status === "accepted") {
    if (isSender) {
      return (
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
      );
    }
    return (
      <Badge
        variant="outline"
        className="rounded-full bg-blue-500/5 text-blue-600 border-blue-500/20 px-4 py-1.5 text-[10px] font-black tracking-widest italic animate-pulse"
      >
        PRÉPARATION...
      </Badge>
    );
  }

  // 3. SHIPPED: Requester marks as COMPLETED (Received)
  if (status === "shipped") {
    if (!isSender) {
      return (
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
      );
    }
    return (
      <Badge
        variant="outline"
        className="rounded-full bg-orange-500/5 text-orange-600 border-orange-500/20 px-4 py-1.5 text-[10px] font-black tracking-widest italic animate-pulse flex gap-2"
      >
        <Truck className="h-3 w-3" /> EN ROUTE...
      </Badge>
    );
  }

  return null;
}
