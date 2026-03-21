"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Loader2, 
  Minus, 
  Plus, 
  Sparkles, 
  Zap,
  Package,
  CreditCard,
  User,
  History
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
  const { user } = useAuth();
  const supabase = createClient();

  const fetchProducts = useCallback(async (query: string = "") => {
    setIsSearching(true);
    try {
      let q = supabase
        .from("products")
        .select(`
          *,
          stocks!inner(quantity, boutique_id)
        `)
        .eq("stocks.boutique_id", boutiqueId)
        .order("name");

      if (query.trim()) {
        q = q.ilike("name", `%${query}%`);
      } else {
        q = q.limit(32);
      }

      const { data, error } = await q;

      if (error) throw error;
      setSearchResults(data as any[]);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la récupération des produits");
    } finally {
      setIsSearching(false);
    }
  }, [boutiqueId, supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchTerm);
  };

  const addToCart = (product: any) => {
    const stockQty = product.stocks[0].quantity;
    
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
          i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i
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
            toast.warning(`Stock maximum de ${maxStock} atteint pour ce produit.`);
            return { ...i, cartQuantity: maxStock };
          }
          return { ...i, cartQuantity: newQty };
        }
        return i;
      })
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

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

      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;

      toast.success("Vente enregistrée avec succès !");
      
      setCart([]);
      setClientName("Client comptoir");
      setSearchTerm("");
      
      setTimeout(() => {
        fetchProducts(searchTerm || "");
      }, 800);
      
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de l'encaissement", { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 p-6 animate-in fade-in duration-700">
      {/* Left Area: Search & Products */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <input 
            placeholder="Scanner un code barre ou rechercher par nom..." 
            className="w-full h-16 pl-14 pr-6 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProducts(searchTerm)}
          />
          {isSearching && (
            <Loader2 className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {searchResults.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
              <Package className="h-16 w-16" />
              <p className="text-sm font-black tracking-widest italic">Aucun produit trouvé dans cette boutique</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {searchResults.map((product: any) => (
                <div 
                  key={product.id} 
                  className={cn(
                    "group bg-card/40 backdrop-blur-md border border-border/40 rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all duration-500 cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1",
                    product.stocks[0].quantity <= 0 && "opacity-60 grayscale cursor-not-allowed"
                  )}
                  onClick={() => product.stocks[0].quantity > 0 && addToCart(product)}
                >
                  <div className="aspect-square relative w-full bg-muted/30 overflow-hidden border-b border-border/10">
                    <Image 
                      src={product.image_url || "/placeholder-product.jpg"} 
                      alt="" 
                      fill 
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.stocks[0].quantity <= 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                         <Badge variant="destructive" className="rounded-full px-3 py-1 font-black text-[10px] tracking-widest">
                           RUPTURE
                         </Badge>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                       <div className={cn(
                         "h-8 px-3 rounded-full flex items-center justify-center text-[10px] font-black border backdrop-blur-md shadow-sm transition-colors",
                         product.stocks[0].quantity <= 5 ? "bg-rose-500/10 border-rose-500/20 text-rose-600" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                       )}>
                         {product.stocks[0].quantity} dispo
                       </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h4 className="text-sm font-black tracking-tight line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/20">
                       <span className="text-lg font-black tracking-tighter text-primary">
                         {formatCurrency(product.price)}
                       </span>
                       <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <Plus className="h-4 w-4" />
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
      <div className="w-[420px] flex flex-col rounded-[3rem] border border-border/50 bg-card/60 backdrop-blur-2xl shadow-premium overflow-hidden">
        <div className="p-8 border-b border-border/50 bg-primary/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tighter leading-none">Ticket de caisse</h2>
                <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest uppercase mt-1">Session active</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full bg-background/50 border-primary/20 text-primary font-black px-3 py-1 text-[10px]">
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
               <p className="text-[10px] font-black tracking-widest uppercase text-center italic">Le ticket est vide</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex flex-col gap-4 hover:bg-primary/[0.02] transition-colors group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                       <div className="h-12 w-12 rounded-xl border border-border/50 bg-muted/30 relative overflow-hidden shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105">
                         <Image src={item.image_url || "/placeholder-product.jpg"} alt="" fill className="object-cover" />
                       </div>
                       <p className="text-sm font-black tracking-tight leading-tight line-clamp-2">{item.name}</p>
                    </div>
                    <span className="text-sm font-black tracking-tighter tabular-nums text-primary shrink-0">{formatCurrency(item.price * item.cartQuantity)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pl-15">
                    <span className="text-[10px] font-bold text-muted-foreground/50 tracking-wide italic">
                      {formatCurrency(item.price)} / unité
                    </span>
                    <div className="flex items-center gap-2">
                       <button className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}>
                         <Minus className="h-3 w-3" />
                       </button>
                       <span className="text-sm font-black w-6 text-center tabular-nums">{item.cartQuantity}</span>
                       <button className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}>
                         <Plus className="h-3 w-3" />
                       </button>
                       <button className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all ml-2" onClick={() => updateQuantity(item.id, 0)}>
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
               <p className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">Total à encaisser</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter text-primary">{formatCurrency(total)}</span>
               </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
               <CreditCard className="h-6 w-6" />
            </div>
          </div>

          <Button 
            className={cn(
              "w-full h-16 rounded-[1.5rem] text-lg font-black tracking-tighter shadow-xl transition-all duration-500 flex gap-3",
              cart.length === 0 ? "opacity-50 grayscale" : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/20"
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
             <p className="text-[10px] font-black tracking-widest uppercase italic">validation système quincaillerie</p>
          </div>
        </div>
      </div>
    </div>
  );
}
