"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Truck,
  Loader2,
  Package,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Product, Boutique } from "@/types";

export function StockRequestTerminal({
  currentBoutiqueId,
  userRole,
}: {
  currentBoutiqueId: string;
  userRole?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [cart, setCart] = useState<(Product & { qty: number })[]>([]);
  const [sourceBoutiqueId, setSourceBoutiqueId] = useState("");
  const [targetBoutiqueId, setTargetBoutiqueId] = useState(currentBoutiqueId);
  const [isProcessing, setIsProcessing] = useState(false);

  const supabase = createClient();

  const fetchProducts = useCallback(
    async (query: string = "") => {
      try {
        let q = supabase
          .from("products")
          .select("*, categories(name)")
          .order("name");
        if (query.trim()) {
          q = q.ilike("name", `%${query}%`);
        } else {
          q = q.limit(20);
        }
        const { data } = await q;
        setProducts(data || []);
      } catch (error) {
        console.error(error);
      }
    },
    [supabase],
  );

  const fetchBoutiques = useCallback(async () => {
    const { data } = await supabase.from("boutiques").select("id, name");
    setBoutiques((data as Boutique[]) || []);
  }, [supabase]);

  useEffect(() => {
    fetchProducts("");
    fetchBoutiques();
  }, [fetchProducts, fetchBoutiques]);

  useEffect(() => {
    setTargetBoutiqueId(currentBoutiqueId);
  }, [currentBoutiqueId]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.name} ajouté`, { duration: 1000 });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    );
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return;
    }
    if (!sourceBoutiqueId) {
      toast.error("Choisissez une boutique source");
      return;
    }
    if (!targetBoutiqueId) {
      toast.error("Choisissez une boutique cible");
      return;
    }
    if (sourceBoutiqueId === targetBoutiqueId) {
      toast.error("La boutique source et cible doivent être différentes");
      return;
    }

    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Create Transfer Request
      const { data: transfer, error: txError } = await supabase
        .from("stock_transfers")
        .insert({
          from_boutique_id: sourceBoutiqueId,
          to_boutique_id: targetBoutiqueId,
          created_by: user?.id,
          status: "pending",
        })
        .select()
        .single();

      if (txError) throw txError;

      // 2. Create Items
      const items = cart.map((item) => ({
        transfer_id: transfer.id,
        product_id: item.id,
        quantity: item.qty,
      }));

      const { error: itemsError } = await supabase
        .from("stock_transfer_items")
        .insert(items);
      if (itemsError) throw itemsError;

      toast.success("Demande de stock envoyée avec succès !");
      setCart([]);
      setSourceBoutiqueId("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error("Erreur", { description: message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-175">
      {/* Product Selection */}
      <div className="flex flex-col flex-1 gap-6 p-8 overflow-hidden border-r border-slate-50 dark:border-slate-800">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
          <input
            placeholder="Rechercher un produit à réapprovisionner..."
            className="w-full h-16 pl-16 pr-8 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 placeholder:font-bold"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchProducts(e.target.value);
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6 custom-scrollbar">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1"
              onClick={() => addToCart(product)}
            >
              <div className="aspect-square relative w-full bg-slate-50 dark:bg-slate-800 overflow-hidden">
                <Image
                  src={product.image_url || "/placeholder-product.jpg"}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 mb-2">
                  {product.category?.name || "Général"}
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors leading-relaxed">
                  {product.name}
                </h4>
                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 tracking-widest transition-colors">
                    Ajouter au panier
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer List (Terminal Sidebar) */}
      <div className="w-110 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-orange-600">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  Terminal Flux
                </h3>
                <p className="text-[11px] font-black text-slate-400 tracking-widest mt-2">
                  Constitution du panier
                </p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] tracking-widest  shadow-lg">
              {cart.length} Lignes
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase">
                Source
              </label>
              <Select
                onValueChange={(v) => setSourceBoutiqueId(v || "")}
                value={sourceBoutiqueId}
              >
                <SelectTrigger
                  className={cn(
                    "h-20 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-sm transition-all duration-500 shadow-sm hover:shadow-md px-6",
                    sourceBoutiqueId
                      ? "border-orange-500/30 ring-4 ring-orange-500/5 text-orange-600"
                      : "border-slate-100",
                  )}
                >
                  <SelectValue placeholder="Source">
                    <span className="truncate max-w-70 inline-block">
                      {boutiques.find((b) => b.id === sourceBoutiqueId)?.name ||
                        "Source"}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-2">
                  {boutiques
                    .filter((b) => b.id !== targetBoutiqueId)
                    .map((b) => (
                      <SelectItem
                        key={b.id}
                        value={b.id}
                        className="font-black text-xs py-4 rounded-xl cursor-pointer focus:bg-orange-50 dark:focus:bg-orange-500/10 focus:text-orange-600 transition-colors uppercase tracking-tight"
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase">
                Cible
              </label>
              <Select
                onValueChange={(v) => setTargetBoutiqueId(v || "")}
                value={targetBoutiqueId}
                disabled={userRole !== "admin"}
              >
                <SelectTrigger
                  className={cn(
                    "h-20 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-sm transition-all duration-500 shadow-sm hover:shadow-md px-6",
                    targetBoutiqueId
                      ? "border-blue-500/30 ring-4 ring-blue-500/5 text-blue-600"
                      : "border-slate-100",
                    userRole !== "admin" && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <SelectValue placeholder="Cible">
                    <span className="truncate max-w-70 inline-block">
                      {boutiques.find((b) => b.id === targetBoutiqueId)?.name ||
                        "Cible"}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-2">
                  {boutiques
                    .filter((b) => b.id !== sourceBoutiqueId)
                    .map((b) => (
                      <SelectItem
                        key={b.id}
                        value={b.id}
                        className="font-black text-xs py-4 rounded-xl cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-500/10 focus:text-blue-600 transition-colors uppercase tracking-tight"
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 p-8 hover:bg-white dark:hover:bg-slate-800/50 transition-all group"
              >
                <div className="h-20 w-20 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={item.image_url || "/placeholder-product.jpg"}
                    alt=""
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight leading-tight mb-4 truncate ">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-1">
                      <button
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                        onClick={() => updateQty(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-black w-10 text-center tabular-nums text-slate-900 dark:text-white">
                        {item.qty}
                      </span>
                      <button
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all ml-auto shadow-sm border border-rose-100 dark:border-rose-500/20"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="py-40 text-center space-y-6 opacity-30">
                <div className="h-24 w-24 rounded-4xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center">
                  <Package className="h-10 w-10 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black tracking-[0.2em]  text-slate-500">
                    Flux inexistant
                  </p>
                  <p className="text-[10px] font-black  text-slate-400 tracking-widest">
                    Initiez un mouvement à gauche
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Button
            className={cn(
              "w-full h-18 rounded-4xl text-sm font-black tracking-widest  shadow-2xl transition-all duration-500 flex gap-4 border-none",
              !sourceBoutiqueId || cart.length === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-orange-600 text-white hover:bg-orange-700 hover:scale-[1.02] shadow-orange-500/20",
            )}
            onClick={handleSubmit}
            disabled={isProcessing || !sourceBoutiqueId || cart.length === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Synchronisation...</span>
              </>
            ) : (
              <>
                <Truck className="h-5 w-5" />
                <span>Soumettre la demande</span>
              </>
            )}
          </Button>
          <p className="text-[10px] text-center text-slate-400 font-bold tracking-widest mt-4  italic">
            Validation sécurisée du transfert logistique
          </p>
        </div>
      </div>
    </div>
  );
}
