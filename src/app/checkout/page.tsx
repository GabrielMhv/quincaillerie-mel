import PublicLayout from "@/components/layout/public-layout";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  return (
    <PublicLayout>
      <div className="relative min-h-screen py-24 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-tight mx-auto">
              <ShieldCheck className="h-3 w-3" /> Paiement sécurisé
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight mx-auto">
              Finaliser votre <br />
              <span className="text-gradient">Commande</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed px-4">
              Veuillez confirmer vos coordonnées pour que nos boutiques puissent
              préparer votre livraison.
            </p>
          </div>

          <div className="mx-auto max-w-3xl glass-card rounded-4xl md:rounded-[3.5rem] overflow-hidden p-1.5 md:p-2 shadow-premium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            <div className="p-6 sm:p-12 lg:p-16 bg-white/40 dark:bg-card/40 rounded-[1.75rem] md:rounded-[3rem] border border-white/20">
              <CheckoutForm />
            </div>
          </div>

          <div className="mt-12 text-center opacity-40">
            <p className="text-[10px] font-bold tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="h-3 w-3" /> Votre partenaire de confiance
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
