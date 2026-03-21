"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Truck, 
  ArrowRightLeft, 
  Loader2, 
  Building2,
  Package,
  Sparkles,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function StockRequestTerminal({ currentBoutiqueId }: { currentBoutiqueId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [boutiques, setBoutiques] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [sourceBoutiqueId, setSourceBoutiqueId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const supabase = createClient();

  const fetchProducts = useCallback(async (query: string = "") => {
    setIsLoadingProducts(true);
    try {
      let q = supabase.from("products").select("*, categories(name)").order("name");
      if (query.trim()) {
        q = q.ilike("name", `%${query}%`);
      } else {
        q = q.limit(20);
      }
      const { data } = await q;
      setProducts(data || []);
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProducts("");
    fetchBoutiques();
  }, [fetchProducts]);

  const fetchBoutiques = async () => {
    const { data } = await supabase
      .from("boutiques")
      .select("id, name")
      .neq("id", currentBoutiqueId);
    setBoutiques(data || []);
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
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
        i.id === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
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

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Create Transfer Request
      const { data: transfer, error: txError } = await supabase
        .from("stock_transfers")
        .insert({
          from_boutique_id: sourceBoutiqueId,
          to_boutique_id: currentBoutiqueId,
          created_by: user?.id,
          status: 'pending'
        })
        .select()
        .single();

      if (txError) throw txError;

      // 2. Create Items
      const items = cart.map(item => ({
        transfer_id: transfer.id,
        product_id: item.id,
        quantity: item.qty
      }));

      const { error: itemsError } = await supabase.from("stock_transfer_items").insert(items);
      if (itemsError) throw itemsError;

      toast.success("Demande de stock envoyée avec succès !");
      setCart([]);
      setSourceBoutiqueId("");
    } catch (error: any) {
      toast.error("Erreur", { description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 p-6 animate-in fade-in duration-700">
      {/* Product Selection */}
      <div className="flex flex-col flex-1 gap-6 overflow-hidden">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
          <input 
            placeholder="Rechercher un produit à demander..." 
            className="w-full h-14 pl-12 pr-6 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchProducts(e.target.value);
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-6 custom-scrollbar">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group bg-card/40 backdrop-blur-md border border-border/40 rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all duration-500 cursor-pointer flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1"
              onClick={() => addToCart(product)}
            >
              <div className="aspect-square relative w-full bg-muted/30 overflow-hidden">
                <Image 
                  src={product.image_url || "/placeholder-product.jpg"} 
                  alt="" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-[10px] font-black tracking-widest text-primary mb-1 italic opacity-60">
                  {product.categories?.name || "Général"}
                </p>
                <h4 className="text-sm font-black tracking-tight line-clamp-2 mb-4 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between">
                   <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Plus className="h-4 w-4" />
                   </div>
                   <span className="text-[10px] font-black tracking-widest text-muted-foreground/40 italic">Ajouter</span>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && !isLoadingProducts && (
             <div className="col-span-full py-20 text-center space-y-4 opacity-30">
               <Package className="h-12 w-12 mx-auto" />
               <p className="text-sm font-black tracking-widest italic">Aucun produit ne correspond à votre recherche</p>
             </div>
          )}
        </div>
      </div>

      {/* Transfer List (Terminal Sidebar) */}
      <div className="w-[420px] flex flex-col rounded-[3rem] border border-border/50 bg-card/60 backdrop-blur-2xl shadow-premium overflow-hidden">
        <div className="p-8 border-b border-border/50 bg-primary/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tighter leading-none">Terminal flux</h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest mt-1 italic">Requête en cours</p>
              </div>
            </div>
            <Badge variant="outline" className="rounded-full bg-background/50 border-primary/20 text-primary font-black px-3 py-1 text-[10px]">
              {cart.length} lignes
            </Badge>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-muted-foreground/40 tracking-widest ml-1 italic">Point d&apos;expédition source</label>
            <Select onValueChange={(v) => setSourceBoutiqueId(v || "")} value={sourceBoutiqueId}>
              <SelectTrigger className={cn(
                "h-16 bg-background/40 backdrop-blur-xl border-border/40 rounded-2xl font-black text-sm transition-all duration-500 shadow-sm hover:shadow-md hover:border-primary/30",
                sourceBoutiqueId ? "border-emerald-500/30 bg-emerald-500/[0.02] text-emerald-600 ring-4 ring-emerald-500/5" : "border-border/50"
              )}>
                <SelectValue placeholder="Choisir la boutique source" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-premium animate-in fade-in zoom-in-95">
                {boutiques.map(b => (
                  <SelectItem key={b.id} value={b.id} className="font-bold text-sm py-4 cursor-pointer focus:bg-primary/10 transition-colors uppercase tracking-tight">{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
          <div className="divide-y divide-border/20">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-6 hover:bg-primary/[0.02] transition-colors group">
                <div className="h-14 w-14 rounded-2xl border border-border/50 bg-muted/30 relative overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <Image src={item.image_url || "/placeholder-product.jpg"} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black tracking-tight leading-tight mb-3 truncate">{item.name}</p>
                  <div className="flex items-center gap-3">
                    <button 
                      className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" 
                      onClick={() => updateQty(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-black w-6 text-center tabular-nums">{item.qty}</span>
                    <button 
                      className="h-7 w-7 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" 
                      onClick={() => updateQty(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button 
                      className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all ml-auto" 
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="py-32 text-center space-y-4 opacity-20">
                <ArrowRightLeft className="h-12 w-12 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-black tracking-widest italic opacity-40">Panier vide</p>
                  <p className="text-[10px] font-bold opacity-30">Initialisez un flux à gauche</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 border-t border-border/40 bg-muted/20">
          <Button 
            className={cn(
              "w-full h-16 rounded-[1.5rem] text-base font-black tracking-tighter shadow-xl transition-all duration-500 flex gap-3",
              (!sourceBoutiqueId || cart.length === 0) ? "opacity-50 grayscale" : "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/20"
            )}
            onClick={handleSubmit}
            disabled={isProcessing || cart.length === 0 || !sourceBoutiqueId}
          >
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Truck className="h-6 w-6" />
                <span>Confirmer l&apos;expédition</span>
              </>
            )}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground/40 font-bold tracking-widest mt-4 italic">
            Validation sécurisée du transfert logistique
          </p>
        </div>
      </div>
    </div>
  );
}
