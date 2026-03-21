"use client";

import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const totalStock = product.stocks?.reduce((acc, stock) => acc + stock.quantity, 0) || 0;
  const isOutOfStock = totalStock === 0;

  const handleAddToCart = () => {
    if (!product.stocks || product.stocks.length === 0) return;
    
    // Pick boutique with most stock
    const bestStock = [...product.stocks].sort((a, b) => b.quantity - a.quantity)[0];
    
    if (bestStock.quantity >= quantity) {
      addItem(product, bestStock.boutique_id, quantity);
      toast.success(`${product.name} ajouté au panier (${quantity})`);
    } else {
      toast.error("Quantité demandée supérieure au stock disponible");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 items-center rounded-xl border px-4 bg-background">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-xl font-bold px-2 hover:text-primary transition-colors"
          >
            -
          </button>
          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="text-xl font-bold px-2 hover:text-primary transition-colors"
          >
            +
          </button>
        </div>
        <Button 
          size="lg" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 h-12 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          <ShoppingCart className="h-5 w-5" />
          Ajouter au panier
        </Button>
      </div>
      {isOutOfStock && (
        <p className="text-sm font-medium text-destructive text-center">
          Ce produit est actuellement victime de son succès.
        </p>
      )}
    </div>
  );
}
