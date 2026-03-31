"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, UserPlus, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  handlerId,
  handlerName,
  currentUserId,
}: {
  orderId: string;
  currentStatus: string;
  handlerId?: string | null;
  handlerName?: string | null;
  currentUserId?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  if (currentStatus === "completed") return null;

  const handleAssign = async () => {
    setIsLoading(true);
    try {
      // Small real-time check
      const { data: order } = await supabase
        .from("orders")
        .select("handler_id")
        .eq("id", orderId)
        .single();
      if (order?.handler_id) {
        toast.error("Déjà pris en charge", {
          description: "Un autre employé a déjà pris cette commande.",
        });
        router.refresh();
        return;
      }

      const { error } = await supabase
        .from("orders")
        .update({ handler_id: currentUserId })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Commande assignée", {
        description: "Vous avez pris en charge cette commande.",
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'assignation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Commande marquée comme livrée");
      router.refresh();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error("Erreur lors de la validation", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!handlerId) {
    return (
      <Button
        size="sm"
        onClick={handleAssign}
        disabled={isLoading || !currentUserId}
        className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
        Prendre en charge
      </Button>
    );
  }

  if (handlerId === currentUserId) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">
          Votre responsabilité
        </span>
        <Button
          size="sm"
          onClick={handleValidate}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 h-8 gap-1.5"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Valider Livraison
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 select-none rounded bg-muted/60 px-3 py-1.5 border text-muted-foreground opacity-90 h-8">
      <Lock className="h-3 w-3" />
      <span className="text-xs font-semibold">
        Traite par {handlerName || "Collègue"}
      </span>
    </div>
  );
}
