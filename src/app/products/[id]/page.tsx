import { createClient } from "@/lib/supabase/server";
import PublicLayout from "@/components/layout/public-layout";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ShieldCheck, Truck, RefreshCcw } from "lucide-react";
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
    .select(
      `
      *,
      category:categories(name),
      stocks(id, boutique_id, quantity, boutique:boutiques(name))
    `,
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }

  const typedProduct = product as unknown as Product;
  const totalStock =
    typedProduct.stocks?.reduce((acc, stock) => acc + stock.quantity, 0) || 0;
  const isOutOfStock = totalStock === 0;

  return (
    <PublicLayout>
      <div className="relative min-h-screen pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Advanced Decorative Elements */}
        <div className="hidden lg:block absolute top-0 right-[-10%] w-200 h-200 bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
        <div className="hidden lg:block absolute bottom-[-10%] left-[-10%] w-150 h-150 bg-blue-500/10 rounded-full blur-[150px] -z-10 pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 lg:pt-32 relative z-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-primary hover:opacity-70 transition-all mb-12 sm:mb-16 lg:mb-20"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;inventaire
          </Link>

          <div className="grid gap-12 lg:gap-20 lg:grid-cols-2 lg:items-start">
            {/* Product Image Section */}
            <div className="relative animate-in fade-in slide-in-from-left-12 duration-1000">
              <div className="relative aspect-4/5 sm:aspect-square overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-white/40 dark:bg-card/40 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-3xl">
                <Image
                  src={typedProduct.image_url || "/placeholder-product.jpg"}
                  alt={typedProduct.name}
                  fill
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
                    <div className="bg-white/95 text-black px-8 py-3 rounded-full text-[10px] font-black tracking-[0.3em] shadow-2xl">
                      ÉPUISÉ • RUPTURE
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col gap-8 md:gap-12 animate-in fade-in slide-in-from-right-12 duration-1000 delay-200 text-center lg:text-left">
              <div className="space-y-6 md:space-y-8">
                {typedProduct.category && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest leading-none mx-auto lg:mx-0">
                    {typedProduct.category.name}
                  </div>
                )}
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-slate-900 dark:text-white mx-auto lg:mx-0">
                  {typedProduct.name}.
                </h1>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-8">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter text-primary tabular-nums">
                    {formatCurrency(typedProduct.price)}
                  </span>
                  {totalStock > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black tracking-tighter">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {totalStock} UNITÉS DISPONIBLES
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto lg:mx-0">
                <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400">
                  DESCRIPTION DÉTAILLÉE
                </h3>
                <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {typedProduct.description ||
                    "Aucune description détaillée n'est disponible pour ce produit d'exception."}
                </p>
              </div>

              {/* Availability per Boutique Section */}
              {typedProduct.stocks && typedProduct.stocks.length > 0 && (
                <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-white/5 mx-auto lg:mx-0 w-full max-w-md">
                  <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 text-center lg:text-left">
                    POINTS DE VENTE ACTIFS
                  </h3>
                  <div className="grid gap-4">
                    {typedProduct.stocks?.map((stock) => (
                      <div
                        key={stock.id}
                        className="flex items-center justify-between p-5 rounded-2xl md:rounded-3xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-sm group hover:scale-[1.02] transition-all"
                      >
                        <div className="space-y-1 text-left">
                          <span className="text-[9px] font-black tracking-widest text-primary opacity-60">
                            BOUTIQUE
                          </span>
                          <p className="text-base font-black tracking-tight leading-none text-slate-800 dark:text-white ">
                            {stock.boutique?.name}
                          </p>
                        </div>
                        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black">
                          {stock.quantity} DISPOS
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 border-t pt-8">
                {/* Client-side AddToCart button */}
                <AddToCartButton product={typedProduct} />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 pt-12 border-t border-slate-200 dark:border-white/5">
                {[
                  {
                    icon: Truck,
                    title: "LIVRAISON TOGO",
                    desc: "Sous 24-48h à Lomé",
                  },
                  {
                    icon: ShieldCheck,
                    title: "GARANTIE PRO",
                    desc: "Qualité certifiée",
                  },
                  {
                    icon: RefreshCcw,
                    title: "RETOURS FACILES",
                    desc: "Service client 7j/7",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 shadow-sm group hover:-translate-y-1 transition-all"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
