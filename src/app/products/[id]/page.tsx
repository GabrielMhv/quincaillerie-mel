import { createClient } from "@/lib/supabase/server";
import PublicLayout from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Product } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      stocks(id, boutique_id, quantity, boutique:boutiques(name))
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const typedProduct = product as unknown as Product;
  const totalStock = typedProduct.stocks?.reduce((acc, stock) => acc + stock.quantity, 0) || 0;
  const isOutOfStock = totalStock === 0;

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted border shadow-sm">
            <Image
              src={typedProduct.image_url || "/placeholder-product.jpg"}
              alt={typedProduct.name}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <Badge variant="destructive" className="text-xl px-6 py-2">
                  Rupture de stock
                </Badge>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              {typedProduct.category && (
                <Badge variant="secondary" className="mb-4">
                  {typedProduct.category.name}
                </Badge>
              )}
              <h1 className="text-4xl font-extrabold tracking-tight">{typedProduct.name}</h1>
              <div className="mt-4 flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(typedProduct.price)}
                </span>
                {totalStock > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10">
                    En stock ({totalStock} unités)
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Description</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {typedProduct.description || "Aucune description détaillée n'est disponible pour ce produit."}
              </p>
            </div>

            {/* Stocks per boutique */}
            {typedProduct.stocks && typedProduct.stocks.length > 0 && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-bold">Disponibilité par boutique</h3>
                <div className="grid gap-3">
                  {typedProduct.stocks.map((stock: any) => (
                    <div key={stock.id} className="flex items-center justify-between p-3 rounded-xl border bg-card/50">
                      <span className="text-sm font-medium">{stock.boutique?.name}</span>
                      <Badge variant={stock.quantity > 0 ? "outline" : "secondary"}>
                        {stock.quantity} dispos
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 border-t pt-8">
               {/* Client-side AddToCart button */}
               <AddToCartButton product={typedProduct} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-8">
              {[
                { icon: Truck, title: "Livraison rapide", desc: "Sous 24-48h" },
                { icon: ShieldCheck, title: "Garantie Pro", desc: "Qualité certifiée" },
                { icon: RefreshCcw, title: "Retours faciles", desc: "Sous 14 jours" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-muted/30">
                  <item.icon className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm font-bold">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
