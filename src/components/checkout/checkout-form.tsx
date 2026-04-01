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
import { LocationPicker } from "./location-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CheckoutForm() {
  const { items, getTotal, clearCart, boutiqueId } = useCartStore();
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    // Fetch employees for referral selection
    async function fetchEmployees() {
      const { data } = await supabase
        .from("users")
        .select("id, name")
        .in("role", ["employee", "manager", "admin"])
        .order("name");
      if (data) setEmployees(data);
    }
    fetchEmployees();
  }, [supabase]);

  const [formData, setFormData] = useState({
    client_name: "",
    phone: "",
    address: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    source: "" as OrderSource,
    referred_employee_name: "",
    is_scheduled: false,
    scheduled_at: "",
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
      // Generate order ID client-side to avoid needing SELECT permission after INSERT
      const orderId = crypto.randomUUID();

      // 1. Create the order
      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        client_name: formData.client_name,
        phone: formData.phone,
        address: formData.address || null,
        latitude: formData.latitude ?? null,
        longitude: formData.longitude ?? null,
        source: formData.source || null,
        referred_employee_name:
          formData.source === "employe" && formData.referred_employee_name
            ? formData.referred_employee_name
            : null,
        total: getTotal(),
        boutique_id: boutiqueId,
        status: "pending",
        is_scheduled: formData.is_scheduled,
        scheduled_at: formData.is_scheduled ? formData.scheduled_at : null,
      });

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItemsToInsert = items.map((item) => ({
        order_id: orderId,
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
      router.push(`/order-success?id=${orderId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      // Supabase errors have non-enumerable properties, extract manually
      const msg = errorMessage;
      const hint = (error as { hint?: string })?.hint ?? "";
      const code = (error as { code?: string })?.code ?? "";
      const detail = (error as { details?: string })?.details ?? "";
      // Log every accessible property
      console.error("Checkout error:", error);
      console.error(
        "  → message:",
        msg,
        "| code:",
        code,
        "| hint:",
        hint,
        "| details:",
        detail,
      );
      toast.error(`Erreur lors de la commande : ${msg}`, {
        description: hint || detail || `Code: ${code || "inconnu"}`,
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
          <h2 className="text-2xl font-black tracking-tighter">
            Vos coordonnées
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <Label
              htmlFor="client_name"
              className="text-[10px] font-black tracking-tight opacity-60 ml-1"
            >
              Nom complet *
            </Label>
            <Input
              id="client_name"
              required
              placeholder="Ex: Jean Dupont"
              className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40"
              value={formData.client_name}
              onChange={(e) =>
                setFormData({ ...formData, client_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="phone"
              className="text-[10px] font-black tracking-tight opacity-60 ml-1"
            >
              Numéro de téléphone *
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              placeholder="+237 ..."
              className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="address"
              className="text-[10px] font-black tracking-tight opacity-60 ml-1"
            >
              Adresse de livraison (Optionnelle)
            </Label>
            <Input
              id="address"
              placeholder="Quartier, Rue, Immeuble..."
              className="h-14 rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black tracking-tight opacity-60 ml-1">
              Localisation GPS (Recommandé)
            </Label>
            <LocationPicker
              onLocationSelect={(lat, lng, addr) =>
                setFormData({
                  ...formData,
                  latitude: lat,
                  longitude: lng,
                  address: addr || formData.address,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter">
            Retrait & Logistique
          </h2>
        </div>

        <div className="space-y-6">
          <RadioGroup
            defaultValue="immediate"
            onValueChange={(value) =>
              setFormData({ ...formData, is_scheduled: value === "scheduled" })
            }
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div className="relative">
              <RadioGroupItem
                value="immediate"
                id="immediate"
                className="peer sr-only"
              />
              <Label
                htmlFor="immediate"
                className="flex items-center justify-between p-6 h-20 rounded-3xl bg-secondary/30 border-2 border-transparent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="space-y-1">
                  <p className="font-black tracking-tight text-sm">
                    Vente immédiate
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                    Récupération sous 24h
                  </p>
                </div>
                <div className="h-6 w-6 rounded-full border-2 border-primary/20 peer-data-[state=checked]:border-primary transition-all flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary scale-0 peer-data-[state=checked]:scale-100 transition-transform" />
                </div>
              </Label>
            </div>

            <div className="relative">
              <RadioGroupItem
                value="scheduled"
                id="scheduled"
                className="peer sr-only"
              />
              <Label
                htmlFor="scheduled"
                className="flex items-center justify-between p-6 h-20 rounded-3xl bg-secondary/30 border-2 border-transparent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="space-y-1">
                  <p className="font-black tracking-tight text-sm">
                    Passer à l&apos;avance
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                    Retrait à une date choisie
                  </p>
                </div>
                <div className="h-6 w-6 rounded-full border-2 border-primary/20 peer-data-[state=checked]:border-primary transition-all flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-primary scale-0 peer-data-[state=checked]:scale-100 transition-transform" />
                </div>
              </Label>
            </div>
          </RadioGroup>

          {formData.is_scheduled && (
            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="space-y-3">
                <Label
                  htmlFor="scheduled_at"
                  className="text-[10px] font-black tracking-tight opacity-60 ml-1"
                >
                  Date & Heure de retrait prévue *
                </Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  required
                  className="h-14 rounded-2xl bg-white dark:bg-card border-none px-6 font-bold tracking-tight text-sm focus-visible:ring-primary/40 appearance-none"
                  value={formData.scheduled_at}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduled_at: e.target.value })
                  }
                />
                <p className="text-[10px] font-bold text-muted-foreground opacity-40 italic ml-1">
                  Nos équipes prépareront votre commande pour cette échéance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Landmark className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter">
            Comment nous avez-vous connus ?
          </h2>
        </div>

        <RadioGroup
          required
          onValueChange={(value) =>
            setFormData({ ...formData, source: value as OrderSource })
          }
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
              <RadioGroupItem
                value={source.id}
                id={source.id}
                className="peer sr-only"
              />
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
            <Label
              htmlFor="referred_employee_name"
              className="text-[10px] font-black tracking-tight opacity-60 ml-1"
            >
              Sélectionner le collaborateur *
            </Label>
            <Select
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  referred_employee_name: value || "",
                })
              }
              value={formData.referred_employee_name}
            >
              <SelectTrigger className="h-14 w-full rounded-2xl bg-secondary/30 border-none px-6 font-medium focus-visible:ring-primary/40">
                <SelectValue placeholder="Choisir un employé..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl bg-card/95 backdrop-blur-xl">
                {employees.map((emp) => (
                  <SelectItem
                    key={emp.id}
                    value={emp.name || ""}
                    className="capitalize py-3 px-6 cursor-pointer focus:bg-primary/10"
                  >
                    {emp.name}
                  </SelectItem>
                ))}
                {employees.length === 0 && (
                  <div className="p-4 text-xs text-muted-foreground italic text-center">
                    Aucun collaborateur trouvé
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-border/50 space-y-10">
        <div className="glass-card rounded-[2.5rem] p-8 space-y-4">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[11px] font-black tracking-tight opacity-40">
              Récapitulatif articles ({items.length})
            </span>
            <span className="font-bold tabular-nums">
              {formatCurrency(getTotal())}
            </span>
          </div>
          <div className="flex justify-between items-end border-t border-border/20 pt-4">
            <span className="text-xs font-black tracking-tight text-primary">
              Montant à régler
            </span>
            <span className="text-4xl font-black tracking-tighter tabular-nums decoration-primary decoration-4 underline-offset-8 underline">
              {formatCurrency(getTotal())}
            </span>
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
            <>
              Confirmer la commande{" "}
              <Zap className="ml-3 h-6 w-6 fill-white transition-transform group-hover:scale-125 group-hover:rotate-12" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
