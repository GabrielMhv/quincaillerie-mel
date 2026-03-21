"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Zap, ShieldCheck, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import type { OrderSource } from "@/types";

export function CheckoutForm() {
  const { items, getTotal, clearCart, boutiqueId } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    client_name: "",
    phone: "",
    address: "",
    source: "" as OrderSource,
    referred_employee_name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    if (!boutiqueId) {
      toast.error("Erreur technique : aucune boutique associée au panier");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          client_name: formData.client_name,
          phone: formData.phone,
          address: formData.address,
          source: formData.source,
          referred_employee_name: formData.source === "employe" ? formData.referred_employee_name : null,
          total: getTotal(),
          boutique_id: boutiqueId,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItemsToInsert = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // SUCCESS
      clearCart();
      toast.success("Commande validée avec succès !");
      router.push(`/order-success?id=${orderData.id}`);
      
    } catch (error: any) {
      console.error('Checkout error detail:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error(`Erreur lors de la commande : ${error.message || "Erreur inconnue"}`, {
        description: error.hint || "Veuillez vérifier les informations saisies."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
           </div>
           <h2 className="text-2xl font-black tracking-tighter">Vos coordonnées</h2>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="client_name" className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nom complet *</Label>
            <Input
              id="client_name"
              required
              placeholder="Ex: Jean Dupont"
              className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Numéro de téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              required
              placeholder="+237 ..."
              className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Adresse de livraison (Optionnelle)</Label>
          <Input
            id="address"
            placeholder="Quartier, Rue, Immeuble..."
            className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-border/50">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Landmark className="h-5 w-5" />
           </div>
           <h2 className="text-2xl font-black tracking-tighter">Comment nous avez-vous connus ?</h2>
        </div>
        
        <RadioGroup
          required
          onValueChange={(value) => setFormData({ ...formData, source: value as OrderSource })}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {[
            { id: "reseaux_sociaux", label: "Réseaux sociaux" },
            { id: "ami", label: "Par un ami" },
            { id: "publicite", label: "Publicité" },
            { id: "passage_boutique", label: "Passage devant la boutique" },
            { id: "employe", label: "Employé de l'entreprise" },
          ].map((source) => (
            <div key={source.id} className="relative">
               <RadioGroupItem value={source.id} id={source.id} className="peer sr-only" />
               <Label 
                 htmlFor={source.id} 
                 className="flex items-center p-4 h-14 rounded-2xl bg-secondary/30 border-2 border-transparent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all font-bold tracking-tight text-sm"
               >
                 {source.label}
               </Label>
            </div>
          ))}
        </RadioGroup>

        {formData.source === "employe" && (
          <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <Label htmlFor="referred_employee_name" className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Nom du collaborateur *</Label>
            <Input
              id="referred_employee_name"
              required
              placeholder="Saisissez le nom complet..."
              className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40"
              value={formData.referred_employee_name}
              onChange={(e) => setFormData({ ...formData, referred_employee_name: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-border/50 space-y-10">
        <div className="glass-card rounded-[2.5rem] p-8 space-y-4">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[11px] font-black uppercase tracking-widest opacity-40">Récapitulatif Articles ({items.length})</span>
            <span className="font-bold tabular-nums">{formatCurrency(getTotal())}</span>
          </div>
          <div className="flex justify-between items-end border-t border-border/20 pt-4">
            <span className="text-xs font-black uppercase tracking-widest text-primary">Montant à régler</span>
            <span className="text-4xl font-black tracking-tighter tabular-nums decoration-primary decoration-4 underline-offset-8 underline">{formatCurrency(getTotal())}</span>
          </div>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full h-20 rounded-3xl text-lg font-black tracking-tight shadow-3xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 group"
          disabled={isLoading || items.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Confirmation...
            </>
          ) : (
            <>Confirmer la commande <Zap className="ml-3 h-6 w-6 fill-white transition-transform group-hover:scale-125 group-hover:rotate-12" /></>
          )}
        </Button>
      </div>
    </form>
  );
}
