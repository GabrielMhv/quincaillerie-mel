"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Package, Sparkles } from "lucide-react";
import NextImage from "next/image";

export function TransferItemsModal({ transferId }: { transferId: string }) {
  const [items, setItems] = useState<
    Array<{
      quantity: number;
      product?: { name: string; image_url: string | null };
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  const loadItems = async () => {
    setLoading(true);
    try {
      // 1. Fetch parent record for single-item data
      const { data: parent } = await supabase
        .from("stock_transfers")
        .select(
          `
          product_id,
          quantity,
          product:products(name, image_url)
        `,
        )
        .eq("id", transferId)
        .single();

      // 2. Fetch child items for multi-item data
      const { data: children } = await supabase
        .from("stock_transfer_items")
        .select(
          `
          quantity,
          product:products(name, image_url)
        `,
        )
        .eq("transfer_id", transferId);

      const allItems = [];
      if (parent?.product_id && parent?.quantity) {
        allItems.push({
          quantity: parent.quantity,
          product: parent.product,
        });
      }

      if (children && children.length > 0) {
        children.forEach(
          (item: {
            quantity: number;
            product?: { name: string; image_url: string | null };
          }) => {
            allItems.push(item);
          },
        );
      }

      setItems(allItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) loadItems();
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4 rounded-xl gap-2 text-[10px] font-black tracking-widest hover:bg-primary/10 hover:text-primary transition-all border border-border/50"
          >
            <Eye className="h-3.5 w-3.5" /> Détails
          </Button>
        }
      />
      <DialogContent className="max-w-2xl rounded-[3rem] border-border/50 bg-card/90 backdrop-blur-2xl shadow-premium p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tighter">
                Inventaire du transfert
              </DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest mt-1 italic">
                Vérification des lignes de mouvement
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
              <p className="text-[10px] font-black tracking-widest text-muted-foreground/40 animate-pulse">
                Extraction des données...
              </p>
            </div>
          ) : (
            <div className="rounded-4xl border border-border/50 overflow-hidden bg-background/30 backdrop-blur-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 h-14 border-b border-border/50 text-[10px] font-black text-muted-foreground/40 tracking-widest italic">
                    <th className="px-6 text-left">Article</th>
                    <th className="px-6 text-center">Quantité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="h-16 group hover:bg-primary/2 transition-colors"
                    >
                      <td className="px-6">
                        <div className="flex items-center gap-3">
                          {item.product?.image_url && (
                            <NextImage
                              src={item.product.image_url}
                              alt={item.product.name}
                              width={32}
                              height={32}
                              className="rounded-lg object-cover border border-border/50"
                            />
                          )}
                          <span className="font-black tracking-tight text-foreground/80 group-hover:text-primary transition-colors">
                            {item.product?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 text-center">
                        <div className="inline-flex h-8 px-4 rounded-xl bg-primary/5 border border-primary/10 items-center justify-center">
                          <span className="text-sm font-black tabular-nums">
                            {item.quantity}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-20 text-center text-muted-foreground/30 font-bold italic"
                      >
                        Aucun article sur ce transfert
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-8 pt-0 flex justify-end">
          <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black tracking-widest text-primary italic">
              Validation Logistique
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
