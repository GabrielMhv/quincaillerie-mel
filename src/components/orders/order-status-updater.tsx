"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { assignOrderHandlerAction } from "@/app/actions/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  handlerId,
  handlerName,
  currentUserId,
  currentUserRole,
  employees,
}: {
  orderId: string;
  currentStatus: string;
  handlerId?: string | null;
  handlerName?: string | null;
  currentUserId?: string;
  currentUserRole?: string;
  employees: { id: string; name: string; boutique_id: string | null; role: string }[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const canAssign = currentUserRole === "cashier" || currentUserRole === "admin";

  if (currentStatus === "completed") return null;

  const handleAssign = async () => {
    if (!selectedEmployeeId) {
      toast.error("Sélectionnez un employé");
      return;
    }

    setIsLoading(true);
    try {
      const result = await assignOrderHandlerAction(orderId, selectedEmployeeId);
      if (result.error) throw new Error(result.error);
      toast.success("Commande assignée", {
        description: "La commande a été attribuée à l'employé choisi.",
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

  if (!handlerId && canAssign) {
    const availableEmployees = employees.filter(
      (employee) => employee.role === "employee",
    );

    return (
      <div className="flex flex-col gap-2 min-w-52">
        <Select
          value={selectedEmployeeId}
          onValueChange={(value) => setSelectedEmployeeId(value ?? "")}
        >
          <SelectTrigger className="h-8 rounded-lg text-xs font-semibold">
            <SelectValue placeholder="Attribuer à un employé" />
          </SelectTrigger>
          <SelectContent>
            {availableEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleAssign}
          disabled={isLoading || !selectedEmployeeId}
          className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          Attribuer
        </Button>
      </div>
    );
  }

  if (handlerId === currentUserId) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-bold text-muted-foreground mr-1">
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
