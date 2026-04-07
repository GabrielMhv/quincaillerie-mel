"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/app/actions/products";
import { categorySchema } from "@/lib/validations/product";
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
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategoryFormModalProps {
  category?: Category;
}

export function CategoryFormModal({ category }: CategoryFormModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState(category?.name || "");

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const rawData = { name };

    const validation = categorySchema.safeParse(rawData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      if (category) {
        // Update via Server Action
        const result = await updateCategory(category.id, rawData);
        if (result.error) throw new Error(result.error);
        toast.success("Catégorie mise à jour");
      } else {
        // Create via Server Action
        const result = await createCategory(rawData);
        if (result.error) throw new Error(result.error);
        toast.success("Catégorie créée");
      }

      setOpen(false);
      router.refresh();
      if (!category) {
        setName("");
      }
    } catch (error: unknown) {
      console.error("Error saving category:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          category ? (
            <Button variant="ghost" size="icon" className="hover:text-primary">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une catégorie
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {category ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              Entrez le nom de la catégorie ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Électricité"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Chargement..." : category ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
