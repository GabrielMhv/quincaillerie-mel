"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShoppingCart,
  Trash2,
  Loader2,
  Minus,
  Plus,
  Zap,
  Package,
  CreditCard,
  User,
  History,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface POSItem extends Product {
  cartQuantity: number;
}

export function POSTerminal({ boutiqueId }: { boutiqueId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientName, setClientName] = useState("Client comptoir");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(data || []);
    };
    fetchCategories();
  }, [supabase]);

  const fetchProducts = useCallback(
    async (query: string = "", categoryId: string | null = null) => {
      setIsSearching(true);
      try {
        let q = supabase
          .from("products")
          .select(
            `
          *,
          stocks!inner(quantity, boutique_id)
        `,
          )
          .eq("stocks.boutique_id", boutiqueId)
          .order("name");

        if (query.trim()) {
          q = q.ilike("name", `%${query}%`);
        }

        if (categoryId) {
          q = q.eq("category_id", categoryId);
        }

        const { data, error } = await q.limit(40);

        if (error) throw error;
        setSearchResults(data as Product[]);
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de la récupération des produits");
      } finally {
        setIsSearching(false);
      }
    },
    [boutiqueId, supabase],
  );

  useEffect(() => {
    fetchProducts(searchTerm, selectedCategoryId);
  }, [fetchProducts, selectedCategoryId, searchTerm]);

  const addToCart = (product: Product) => {
    const stockQty =
      (
        product.stocks as unknown as { quantity: number; boutique_id: string }[]
      )?.[0]?.quantity || 0;

    if (stockQty <= 0) {
      toast.warning("Produit en rupture de stock");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= stockQty) {
          toast.warning("Stock maximum atteint pour ce produit");
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i,
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    toast.success(`${product.name} ajouté`, { duration: 1000 });
  };

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }

    setCart((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const maxStock = i.stocks?.[0]?.quantity || 0;
          if (newQty > maxStock) {
            toast.warning(
              `Stock maximum de ${maxStock} atteint pour ce produit.`,
            );
            return { ...i, cartQuantity: maxStock };
          }
          return { ...i, cartQuantity: newQty };
        }
        return i;
      }),
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.cartQuantity,
    0,
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          client_name: clientName,
          phone: "N/A",
          source: "passage_boutique",
          total: total,
          status: "pending",
          boutique_id: boutiqueId,
          employee_id: user?.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert items
      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.cartQuantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(items);
      if (itemsError) throw itemsError;

      toast.success("Vente enregistrée avec succès !");

      setCart([]);
      setClientName("Client comptoir");
      setSearchTerm("");

      setTimeout(() => {
        fetchProducts(searchTerm || "");
      }, 800);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error("Erreur lors de l'encaissement", {
        description: message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-140px)] gap-6 lg:gap-8 p-4 sm:p-6 animate-in fade-in duration-700 overflow-hidden">
      {/* Left Area: Search & Products */}
      <div className="flex-1 flex flex-col gap-4 lg:gap-6 overflow-hidden min-h-0">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="relative group">
            <Search className="absolute left-4 sm:left-6 top-1/2 h-5 w-5 sm:h-6 sm:w-6 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Rechercher un produit..."
              className="w-full h-14 sm:h-20 pl-12 sm:pl-16 pr-6 sm:pr-8 bg-card/60 backdrop-blur-3xl border-2 border-border/50 rounded-2xl sm:rounded-[2.5rem] text-sm sm:text-lg font-black tracking-tight focus:outline-none focus:ring-4 sm:focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-muted-foreground/20 shadow-xl sm:shadow-2xl shadow-primary/5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-4 sm:right-6 top-1/2 h-5 w-5 sm:h-6 sm:w-6 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 px-1 custom-scrollbar no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black tracking-widest transition-all duration-300 shrink-0 whitespace-nowrap border italic",
                !selectedCategoryId
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/50",
              )}
            >
              Tout le Stock
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={cn(
                  "px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black tracking-widest transition-all duration-300 shrink-0 whitespace-nowrap border italic",
                  selectedCategoryId === cat.id
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/50",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar min-h-0">
          {searchResults.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20 py-10">
              <Package className="h-12 w-12 sm:h-16 sm:w-16" />
              <p className="text-[10px] sm:text-sm font-black tracking-widest italic text-center px-4">
                Aucun produit trouvé dans cette boutique
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pb-6">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "group bg-card/40 backdrop-blur-md border border-border/40 rounded-2xl sm:rounded-4xl overflow-hidden hover:border-primary/50 transition-all duration-500 cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1",
                    ((product.stocks as unknown as { quantity: number }[])?.[0]
                      ?.quantity || 0) <= 0 &&
                      "opacity-60 grayscale cursor-not-allowed",
                  )}
                  onClick={() =>
                    ((product.stocks as unknown as { quantity: number }[])?.[0]
                      ?.quantity || 0) > 0 && addToCart(product)
                  }
                >
                  <div className="aspect-square relative w-full bg-muted/30 overflow-hidden border-b border-border/10">
                    <Image
                      src={product.image_url || "/placeholder-product.jpg"}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {((product.stocks as unknown as { quantity: number }[])?.[0]
                      ?.quantity || 0) <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <Badge
                          variant="destructive"
                          className="rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-black text-[8px] sm:text-[10px] tracking-widest"
                        >
                          RUPTURE
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                      <div
                        className={cn(
                          "h-6 px-2 sm:h-8 sm:px-3 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-black border backdrop-blur-md shadow-sm transition-colors",
                          ((
                            product.stocks as unknown as { quantity: number }[]
                          )?.[0]?.quantity || 0) <= 5
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-600"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
                        )}
                      >
                        {(
                          product.stocks as unknown as { quantity: number }[]
                        )?.[0]?.quantity || 0}{" "}
                        <span className="hidden sm:inline ml-1">dispo</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-5 flex flex-col flex-1">
                    <h4 className="text-[11px] sm:text-sm font-black tracking-tight line-clamp-2 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <div className="mt-auto flex items-center justify-between pt-2 sm:pt-4 border-t border-border/20">
                      <span className="text-sm sm:text-lg font-black tracking-tighter text-primary">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Ticket */}
      <div className="w-full lg:w-105 flex flex-col rounded-2xl sm:rounded-[3rem] border border-border/50 bg-card/60 backdrop-blur-2xl shadow-xl sm:shadow-premium overflow-hidden h-125 lg:h-auto shrink-0">
        <div className="p-4 sm:p-8 border-b border-border/50 bg-primary/5 shrink-0">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden">
                  <Image
                    src={user.avatar_url}
                    alt="Operator"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                  {user?.name?.charAt(0).toUpperCase() || "OP"}
                </div>
              )}
              <div>
                <h2 className="text-sm sm:text-lg font-black tracking-tighter leading-none">
                  Ticket de caisse
                </h2>
                <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground/60 tracking-widest mt-1 italic">
                  Opérateur : {user?.name || "Invité"} —{" "}
                  {user?.role || "Inconnu"}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="rounded-full bg-background/50 border-primary/20 text-primary font-black px-3 py-1 text-[10px]"
            >
              {cart.reduce((s, i) => s + i.cartQuantity, 0)} lignes
            </Badge>
          </div>

          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Nom du client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-background/50 border border-border/40 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30 shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
              <div className="h-20 w-20 rounded-[2.5rem] bg-muted/40 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <p className="text-[10px] font-black tracking-widest text-center italic">
                Le ticket est vide
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex flex-col gap-4 hover:bg-primary/2 transition-colors group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl border border-border/50 bg-muted/30 relative overflow-hidden shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105">
                        <Image
                          src={item.image_url || "/placeholder-product.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-sm font-black tracking-tight leading-tight line-clamp-2">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-sm font-black tracking-tighter tabular-nums text-primary shrink-0">
                      {formatCurrency(item.price * item.cartQuantity)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pl-15">
                    <span className="text-[10px] font-bold text-muted-foreground/50 tracking-wide italic">
                      {formatCurrency(item.price)} / unité
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all"
                        onClick={() =>
                          updateQuantity(item.id, item.cartQuantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-black w-6 text-center tabular-nums">
                        {item.cartQuantity}
                      </span>
                      <button
                        className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all"
                        onClick={() =>
                          updateQuantity(item.id, item.cartQuantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all ml-2"
                        onClick={() => updateQuantity(item.id, 0)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border/40 bg-muted/20">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest">
                Total à encaisser
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>

          <Button
            className={cn(
              "w-full h-16 rounded-3xl text-lg font-black tracking-tighter shadow-xl transition-all duration-500 flex gap-3",
              cart.length === 0
                ? "opacity-50 grayscale"
                : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/20",
            )}
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
          >
            {isProcessing ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <>
                <Zap className="h-6 w-6" />
                <span>Terminer et encaisser</span>
              </>
            )}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
            <History className="h-3.5 w-3.5" />
            <p className="text-[10px] font-black tracking-widest  italic">
              validation système quincaillerie
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
