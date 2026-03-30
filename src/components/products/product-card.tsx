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
      className="group relative flex flex-col bg-white dark:bg-card rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Badge Flottant - Price */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className="bg-primary hover:bg-primary/90 text-white rounded-full px-3 py-1 text-sm font-bold shadow-md border-none z-20 transition-transform hover:scale-105">
          {formatCurrency(product.price)}
        </Badge>
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 group overflow-hidden">
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
        <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 lg:translate-y-6 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-700 ease-out z-10">
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
      <div className="p-4 flex flex-col flex-1 bg-white dark:bg-card">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-primary dark:text-primary leading-tight line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
            {product.category?.name || "Catégorie inconnue"}
            {relevantStocks && totalStock > 0 ? (
              <span className="text-primary opacity-80 ml-1">
                • {totalStock} dispo.
              </span>
            ) : null}
          </p>
        </div>

        <p className="hidden lg:block text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-card/90 backdrop-blur-sm p-3 rounded-xl border border-slate-100 dark:border-white/5 shadow-lg transform translate-y-2 group-hover:translate-y-0 z-20">
          {product.description || "Aucune description supplémentaire."}
        </p>
        
        <div className="mt-auto hidden">
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
