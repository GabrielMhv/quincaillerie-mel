"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Minus, Loader2 } from "lucide-react";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleUpdate = async (change: number) => {
    const newQuantity = Math.max(0, initialStock + change);
    if (newQuantity === initialStock && change !== 0) return;

    setIsUpdating(true);

    try {
      const { data: existingStock, error: fetchError } = await supabase
        .from("stocks")
        .select("id, quantity")
        .eq("product_id", productId)
        .eq("boutique_id", boutiqueId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const currentDbQuantity = existingStock?.quantity ?? 0;
      const finalQuantity = Math.max(0, currentDbQuantity + change);

      if (existingStock) {
        const { error: updateError } = await supabase
          .from("stocks")
          .update({ quantity: finalQuantity })
          .eq("id", existingStock.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("stocks").insert({
          product_id: productId,
          boutique_id: boutiqueId,
          quantity: finalQuantity,
        });

        if (insertError) throw insertError;
      }

      toast.success(
        change > 0 ? "+" + change + " ajouté" : change + " retiré",
        {
          description: "Nouveau stock : " + finalQuantity,
          duration: 2000,
        },
      );

      onStockUpdated?.();
      router.refresh();
    } catch (error) {
      console.error("Stock update error:", error);
      toast.error("Échec de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative pr-2">
      <button
        onClick={() => handleUpdate(-1)}
        disabled={disabled || isUpdating || initialStock <= 0}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-100 dark:border-slate-700 transition-all active:scale-95 disabled:opacity-30 shadow-sm"
      >
        <Minus className="h-4 w-4" />
      </button>

      <div className="min-w-12.5 px-2 flex flex-col items-center">
        <span className="text-[14px] font-black text-slate-900 dark:text-white tabular-nums leading-none">
          {initialStock}
        </span>
        <span className="text-[8px] font-bold text-slate-400  tracking-tighter mt-1">
          Stock
        </span>
      </div>

      <button
        onClick={() => handleUpdate(1)}
        disabled={disabled || isUpdating}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-100 dark:border-slate-700 transition-all active:scale-95 disabled:opacity-30 shadow-sm"
      >
        <Plus className="h-4 w-4" />
      </button>

      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

      <div className="flex gap-1">
        <button
          onClick={() => handleUpdate(10)}
          disabled={disabled || isUpdating}
          className="h-10 px-3 flex items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-[11px] hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-500/20"
        >
          +10
        </button>
      </div>

      {isUpdating && (
        <div className="ml-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}
