"use client";

import Image from "next/image";
import { type Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Zap, ShoppingCart, Info, CheckCircle2, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  selectedBoutiqueId?: string;
  delay?: number;
  priority?: boolean;
}

export function ProductCard({ product, selectedBoutiqueId, delay = 0, priority = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const relevantStocks = selectedBoutiqueId 
    ? product.stocks?.filter(s => s.boutique_id === selectedBoutiqueId)
    : product.stocks;

  const totalStock = relevantStocks?.reduce((acc, stock) => acc + stock.quantity, 0) || 0;
  const isOutOfStock = totalStock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("Produit en rupture de stock");
      return;
    }
    
    const bestStock = [...(relevantStocks || [])].sort((a, b) => b.quantity - a.quantity)[0];
    
    if (bestStock) {
      addItem(product, bestStock.boutique_id, 1);
      toast.success(`${product.name} ajouté !`, {
        description: "Prêt pour votre projet.",
        icon: <Zap className="h-4 w-4 text-primary fill-primary" />,
      });
    }
  };

  return (
    <div 
      className="group relative flex flex-col bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] p-5 border border-white/50 dark:border-white/10 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_40px_100px_-20px_rgba(29,78,216,0.15)] transition-all duration-700 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Decorative inner glow */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Badge Flottant - Catégorie */}
      <div className="absolute top-6 left-6 z-10">
        {product.category && (
          <Badge className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-black hover:opacity-100 text-[9px] font-black h-7 px-4 rounded-full border-none shadow-premium transition-all">
            {product.category.name}
          </Badge>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-8 bg-slate-200/30 dark:bg-white/5 border border-white/20 dark:border-white/[0.05] group shadow-inner">
        <Image
          src={product.image_url || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          priority={priority}
          className={cn(
            "object-cover transition-transform duration-1000 group-hover:scale-110",
            isOutOfStock && "grayscale opacity-50"
          )}
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        />
        
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
            <div className="bg-white/95 text-black px-6 py-2 rounded-full text-[10px] font-black tracking-widest shadow-2xl">
              Rupture de stock
            </div>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
          <Button 
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="w-full rounded-xl h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black tracking-tight text-xs shadow-2xl active:scale-95 transition-all"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-4 px-1 flex-1 flex flex-col relative z-10">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 opacity-70">
            {product.category?.name} &bull; Equipement Pro
          </p>
        </div>

        <p className="text-[12px] font-medium text-slate-500 line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
          {product.description || "Équipement professionnel de haute précision testé par nos experts."}
        </p>
        
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white group-hover:text-primary transition-colors">{formatCurrency(product.price)}</span>
            <span className="text-[10px] font-bold opacity-30 tracking-widest">Prix unitaire</span>
          </div>
          
          <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all">
             <Plus className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
