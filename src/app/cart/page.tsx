"use client";

import PublicLayout from "@/components/layout/public-layout";
import { useCartStore } from "@/store/cart";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
           {/* Background decorative */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

           <div className="container mx-auto px-6 text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="relative inline-flex">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110" />
                 <div className="relative p-10 rounded-full bg-secondary/50 backdrop-blur-3xl border border-white/20 text-muted-foreground shadow-premium">
                    <ShoppingBag className="h-16 w-16 opacity-40" />
                 </div>
              </div>
              <div className="space-y-4">
                 <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Votre panier <br /> <span className="text-gradient">est vide.</span></h1>
                 <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                   Prêt à lancer votre prochain projet ? Explorez le catalogue de La Championne pour trouver le matériel d'exception.
                 </p>
              </div>
              <Link href="/products" className="inline-block pt-4">
                 <Button size="lg" className="rounded-full px-12 h-18 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all group">
                    Continuer vos achats
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                 </Button>
              </Link>
           </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="relative min-h-screen pb-32 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 pt-12 lg:pt-24 space-y-16 relative z-10">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center lg:text-left">
            <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-tight leading-none">
              <Sparkles className="h-3 w-3" /> Sélection La Championne
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-tight mx-auto lg:mx-0">
              Votre <span className="text-gradient">Panier.</span>
            </h1>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 items-start border-t border-border/50 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-8">
              {items.map((item, i) => (
                <div 
                   key={`${item.product.id}-${item.boutique_id}`} 
                   className="group relative glass-card rounded-[2rem] md:rounded-[3.5rem] p-1.5 md:p-2 hover:shadow-premium-hover transition-all duration-500 hover:-translate-y-1"
                >
                   <div className="bg-white/40 dark:bg-card/40 rounded-[1.75rem] md:rounded-[3rem] border border-white/10 p-4 md:p-6 flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                      <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-[2rem] bg-secondary/30 shadow-inner group">
                        <Image
                          src={item.product.image_url || "/placeholder-product.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110 duration-700"
                          sizes="112px"
                        />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left space-y-2">
                        <h3 className="text-2xl font-black tracking-tighter leading-tight group-hover:text-primary transition-colors">{item.product.name}</h3>
                        <p className="text-[10px] font-bold tracking-tight text-muted-foreground opacity-40">Prix unitaire: {formatCurrency(item.product.price)}</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center glass rounded-2xl p-1 border border-white/20">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="flex h-10 w-12 items-center justify-center text-lg font-black tracking-tighter tabular-nums">
                            {item.quantity}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group-hover:opacity-100 opacity-60"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 glass-card rounded-[4rem] p-4 shadow-premium transition-transform hover:-translate-y-1 duration-500">
                <div className="p-10 bg-white/40 dark:bg-card/40 rounded-[3.5rem] border border-white/20 space-y-10">
                  <h2 className="text-3xl font-black tracking-tighter">Récapitulatif <br /> <span className="text-gradient">de commande</span></h2>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-border/50 pb-4">
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold tracking-tight text-muted-foreground opacity-60">Sous-total</span>
                         <p className="text-xl font-bold tracking-tight leading-none tabular-nums">{formatCurrency(getTotal())}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-border/50 pb-4">
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold tracking-tight text-muted-foreground opacity-60">Livraison logistique</span>
                         <p className="text-sm font-bold text-emerald-600 tracking-tight leading-none">Calculée au checkout</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-xs font-bold tracking-tight text-primary">Montant global TTC</span>
                        <p className="text-5xl font-black tracking-tighter tabular-nums">{formatCurrency(getTotal())}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link href="/checkout" className="w-full">
                      <Button className="w-full h-14 md:h-18 text-base font-bold tracking-tight rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                        Commander <Zap className="h-4 w-4 fill-white" />
                      </Button>
                    </Link>
                  </div>
                  
                  <p className="hidden md:block text-[9px] font-bold tracking-tight text-center opacity-30">
                    Ets La Championne Ségbé & Sanguera
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
