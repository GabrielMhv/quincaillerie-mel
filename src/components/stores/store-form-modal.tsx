"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface Store {
  id: string;
  name: string;
  address: string | null;
}

interface StoreFormModalProps {
  store?: Store;
}

export function StoreFormModal({ store }: StoreFormModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: store?.name || "",
    address: store?.address || "",
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name,
        address: store.address || "",
      });
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (store) {
        // Update
        const { error } = await supabase
          .from("boutiques")
          .update({
            name: formData.name,
            address: formData.address,
          })
          .eq("id", store.id);

        if (error) throw error;
        toast.success("Boutique mise à jour");
      } else {
        // Create
        const { error } = await supabase.from("boutiques").insert([
          {
            name: formData.name,
            address: formData.address,
          },
        ]);

        if (error) throw error;
        toast.success("Boutique créée");
      }

      setOpen(false);
      router.refresh();
      if (!store) {
        setFormData({ name: "", address: "" });
      }
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          store ? (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une boutique
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {store ? "Modifier la boutique" : "Nouvelle boutique"}
            </DialogTitle>
            <DialogDescription>
              Entrez les informations de la boutique ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Boutique Centre-Ville"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Ex: 123 Rue de la Liberté, Cotonou"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Chargement..." : store ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
