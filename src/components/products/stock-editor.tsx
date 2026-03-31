"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

interface StockEditorProps {
  initialStock: number;
  productId: string;
  boutiqueId: string;
  onStockUpdated?: () => void;
  disabled?: boolean;
}

export function StockEditor({
  initialStock,
  productId,
  boutiqueId,
  onStockUpdated,
  disabled,
}: StockEditorProps) {
  const [quantity, setQuantity] = useState(initialStock);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleUpdate = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    setIsUpdating(true);

    try {
      // Check if stock entry exists
      const { data: existingStock, error: fetchError } = await supabase
        .from("stocks")
        .select("id")
        .eq("product_id", productId)
        .eq("boutique_id", boutiqueId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingStock) {
        // Update existing
        const { error: updateError } = await supabase
          .from("stocks")
          .update({ quantity: newQuantity })
          .eq("id", existingStock.id);

        if (updateError) throw updateError;
      } else {
        // Create new stock entry
        const { error: insertError } = await supabase.from("stocks").insert({
          product_id: productId,
          boutique_id: boutiqueId,
          quantity: newQuantity,
        });

        if (insertError) throw insertError;
      }

      setQuantity(newQuantity);
      toast.success("Stock mis à jour");
      onStockUpdated?.();
      router.refresh();
    } catch (error) {
      console.error("Stock update error:", error);
      toast.error("Erreur lors de la mise à jour", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
      setQuantity(initialStock); // Revert UI
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleUpdate(quantity - 1)}
        disabled={disabled || isUpdating || quantity <= 0}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <div className="relative">
        <Input
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          onBlur={(e) => handleUpdate(Number(e.target.value))}
          disabled={disabled || isUpdating}
          className="h-8 w-16 text-center tabular-nums p-0"
        />
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-md">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleUpdate(quantity + 1)}
        disabled={disabled || isUpdating}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
