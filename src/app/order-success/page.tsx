"use client";

import { useEffect, useState, use } from "react";
import PublicLayout from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Package, ArrowRight, Sparkles, Store, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useCartStore } from "@/store/cart";

// Dynamically import PDF components for client-side only rendering
const OrderPDFLink = dynamic(() => import("./pdf-link").then(mod => mod.OrderPDFLink), { 
  ssr: false,
  loading: () => <div className="h-14 w-full bg-muted animate-pulse rounded-2xl" />
});

export default function OrderSuccessPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = use(props.searchParams);
  const orderId = searchParams.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (orderId) {
      const supabase = createClient();
      const fetchOrder = async () => {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*, products(*)), boutique:boutiques(name)")
          .eq("id", orderId)
          .single();

        if (data) {
          setOrder(data);
          clearCart(); // Clear the cart once we confirm success
        }
        setLoading(false);
      };

      fetchOrder();
    }
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-32 text-center animate-pulse">
          <div className="h-20 w-20 bg-primary/10 rounded-full mx-auto" />
          <div className="mt-8 h-8 w-64 bg-muted rounded mx-auto" />
          <div className="mt-4 h-4 w-48 bg-muted rounded mx-auto" />
        </div>
      </PublicLayout>
    );
  }

  if (!order) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-32 text-center glass-card rounded-[4rem]">
          <h1 className="text-4xl font-black tracking-tighter">Commande introuvable</h1>
          <p className="mt-4 text-muted-foreground font-medium">Une erreur est survenue lors du chargement de votre commande.</p>
          <Link href="/products" className="mt-8 inline-block">
            <Button size="lg" className="rounded-full px-12 h-14 font-black uppercase tracking-widest text-xs">Retour au catalogue</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="relative min-h-screen py-24 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-16 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative inline-flex mb-4">
               <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
               <div className="relative p-6 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30 scale-110 lg:scale-125">
                  <CheckCircle2 className="h-10 w-10 lg:h-12 lg:w-12 animate-in zoom-in duration-500 delay-200" />
               </div>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold tracking-tight leading-none">
                 <Zap className="h-3 w-3" /> Confirmation reçue
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">
                Merci pour votre <br />
                <span className="text-gradient decoration-indigo-500">Confiance !</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Votre commande <span className="text-foreground font-black tracking-tighter decoration-primary decoration-4 underline-offset-4">#{order.id.slice(0, 8).toUpperCase()}</span> a été transmise à notre équipe logistique.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {/* Order Summary Card */}
            <div className="lg:col-span-12 glass-card rounded-[3.5rem] overflow-hidden p-2 shadow-premium">
               <div className="p-8 lg:p-12 bg-white/40 dark:bg-card/40 rounded-[3rem] border border-white/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                  <div className="space-y-4 text-center lg:text-left">
                     <div className="text-[10px] font-bold tracking-tight text-muted-foreground opacity-60">Récapitulatif</div>
                     <p className="text-3xl font-black tracking-tighter tabular-nums">{formatCurrency(order.total)}</p>
                     <p className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded d-inline-block">Payé entièrement</p>
                  </div>
                  
                  <div className="space-y-4 text-center lg:text-left">
                     <div className="text-[10px] font-bold tracking-tight text-muted-foreground opacity-60">Livraison vers</div>
                     <div className="flex items-center justify-center lg:justify-start gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <p className="font-bold tracking-tight">{order.client_name}</p>
                     </div>
                     <p className="text-xs text-muted-foreground font-medium">{order.client_phone}</p>
                  </div>

                  <div className="space-y-4 text-center lg:text-left">
                     <div className="text-[10px] font-bold tracking-tight text-muted-foreground opacity-60">Boutique préparatrice</div>
                     <div className="flex items-center justify-center lg:justify-start gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        <p className="font-bold tracking-tight">{order.boutique?.name}</p>
                     </div>
                     <p className="text-xs text-muted-foreground font-medium">Affectation Automatique</p>
                  </div>

                  <div className="flex flex-col gap-4 justify-center items-center lg:items-end">
                     <OrderPDFLink order={order} />
                     <Link href="/" className="w-full">
                        <Button variant="outline" className="w-full rounded-2xl h-14 font-bold tracking-tight text-[11px] border-2 group shadow-xl hover:shadow-primary/10 transition-all">
                           C'est noté !
                        </Button>
                     </Link>
                  </div>
               </div>
            </div>

            {/* Tracking Note */}
            <div className="lg:col-span-12 p-10 rounded-[3.5rem] bg-indigo-900 border border-white/10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-full h-full bg-premium-grid opacity-10 pointer-events-none" />
               <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 text-center md:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-[10px] font-bold tracking-tight backdrop-blur-md">
                        <Package className="h-3 w-3" /> Prochaines étapes
                     </div>
                     <h3 className="text-3xl font-black tracking-tighter">Votre livraison est en route.</h3>
                     <p className="text-lg text-white/70 font-medium leading-relaxed max-w-xl">
                        Un agent logistique vous contactera sous 24h pour confirmer l'horaire précis de passage à l'adresse indiquée.
                     </p>
                  </div>
                  <Link href="/products" className="shrink-0 w-full md:w-auto">
                     <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90 rounded-full px-12 h-16 font-bold tracking-tight text-md shadow-xl">
                        Continuer mes achats
                     </Button>
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
