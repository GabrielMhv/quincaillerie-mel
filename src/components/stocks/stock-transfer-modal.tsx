"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function StockTransferModal({ currentBoutiqueId }: { currentBoutiqueId: string }) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [boutiques, setBoutiques] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [fromBoutiqueId, setFromBoutiqueId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products that exist in other boutiques
      const { data: pData } = await supabase
        .from("products")
        .select("id, name")
        .order("name");
      
      const { data: bData } = await supabase
        .from("boutiques")
        .select("id, name")
        .neq("id", currentBoutiqueId);

      setProducts(pData || []);
      setBoutiques(bData || []);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !fromBoutiqueId || !quantity) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("stock_transfers")
        .insert({
          product_id: selectedProductId,
          from_boutique_id: fromBoutiqueId,
          to_boutique_id: currentBoutiqueId,
          quantity: parseInt(quantity),
          created_by: user?.id,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Demande de transfert envoyée !");
      setOpen(false);
      router.refresh();
      // Reset
      setSelectedProductId("");
      setFromBoutiqueId("");
      setQuantity("1");
    } catch (error: unknown) {
      toast.error("Erreur", {
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="gap-2">
          <ArrowRightLeft className="h-4 w-4" />
          Demander du Stock
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Demande de Transfert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Produit souhaité</Label>
            <Select onValueChange={(v) => setSelectedProductId(v || "")} value={selectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Boutique cible (Source)</Label>
            <Select onValueChange={(v) => setFromBoutiqueId(v || "")} value={fromBoutiqueId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir la boutique source" />
              </SelectTrigger>
              <SelectContent>
                {boutiques.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">Quantité demandée</Label>
            <Input 
              id="qty" 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Envoyer la requête"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
