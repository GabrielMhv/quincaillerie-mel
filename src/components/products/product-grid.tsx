import { Product } from "@/types";
import { ProductCard } from "./product-card";
import { Search } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  selectedBoutiqueId?: string;
}

export function ProductGrid({ products, selectedBoutiqueId }: ProductGridProps) {
  if (products.length === 0) {
    return (
       <div className="py-32 text-center space-y-6 glass-card rounded-[4rem] animate-in fade-in duration-1000">
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
             <Search className="h-10 w-10" />
          </div>
          <div className="space-y-2">
             <h3 className="text-3xl font-black tracking-tighter">Aucun résultat trouvé</h3>
             <p className="text-muted-foreground font-medium">Ajustez vos filtres ou essayez une recherche plus large.</p>
          </div>
       </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-1000">
      {products.map((product, i) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          selectedBoutiqueId={selectedBoutiqueId}
          delay={i * 50}
          priority={i < 4}
        />
      ))}
    </div>
  );
}
