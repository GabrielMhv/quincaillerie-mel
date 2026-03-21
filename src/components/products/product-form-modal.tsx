"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { Product, UserRole, Boutique } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { convertToWebP } from "@/lib/image-utils";

interface Category {
  id: string;
  name: string;
}

interface ProductFormModalProps {
  categories: Category[];
  productToEdit?: Product;
  userRole: UserRole;
  userBoutiqueId: string | null;
  boutiques: Boutique[];
  token?: string; // Optional: To trigger a refresh if needed
}

export function ProductFormModal({ 
  categories, 
  productToEdit, 
  userRole, 
  userBoutiqueId, 
  boutiques 
}: ProductFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(productToEdit?.image_url || "");
  
  // Stock management state
  const [targetBoutique, setTargetBoutique] = useState<string | "all">(
    userRole === "admin" ? "all" : (userBoutiqueId || "")
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const router = useRouter();
  const supabase = createClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast check for Cloudinary Env config
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "quincaillerie_preset"; 

    if (!cloudName) {
      toast.error("Configuration Cloudinary manquante. Utilisez une URL image directement.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Optmisation : Conversion en WebP avant upload
      const webpBlob = await convertToWebP(file);
      const webpFile = new File([webpBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" });

      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur d'upload Cloudinary");

      const data = await response.json();
      setImageUrl(data.secure_url);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const category_id = formData.get("category_id") as string;
    const description = formData.get("description") as string;
    const min_stock_alert = parseInt(formData.get("min_stock_alert") as string);

    try {
      if (productToEdit) {
        // UPDATE
        const { error } = await supabase
          .from("products")
          .update({
            name,
            price,
            category_id: category_id || null,
            description,
            min_stock_alert,
            image_url: imageUrl,
          })
          .eq("id", productToEdit.id);
        
        if (error) throw error;
        toast.success("Produit mis à jour");
      } else {
        // CREATE
        const { data: newProduct, error: productError } = await supabase
          .from("products")
          .insert({
            name,
            price,
            category_id: category_id || null,
            description,
            min_stock_alert,
            image_url: imageUrl,
          })
          .select()
          .single();

        if (productError) throw productError;

        // Handle initial stocks for the new product
        if (newProduct) {
          const stockInserts = [];
          if (userRole === "admin" && targetBoutique === "all") {
            // Add stock for all boutiques
            for (const boutique of boutiques) {
              stockInserts.push({
                product_id: newProduct.id,
                boutique_id: boutique.id,
                quantity: quantities[boutique.id] || 0
              });
            }
          } else {
            // Add stock for a specific boutique
            const bId = userRole === "admin" ? targetBoutique : userBoutiqueId;
            if (bId && bId !== "all") {
              stockInserts.push({
                product_id: newProduct.id,
                boutique_id: bId,
                quantity: quantities[bId] || 0
              });
            }
          }

          if (stockInserts.length > 0) {
            const { error: stockError } = await supabase
              .from("stocks")
              .insert(stockInserts);
            if (stockError) throw stockError;
          }
        }

        toast.success("Produit créé avec succès");
      }
      
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Une erreur est survenue", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {productToEdit ? (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>Éditer</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="gap-2" />}>
          <Plus className="h-4 w-4" />
          Nouveau Produit
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productToEdit ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
          <DialogDescription>
            {productToEdit ? "Modifiez les détails du produit ici." : "Créez un nouveau produit dans votre catalogue."} Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={productToEdit?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix unitaire (€) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={productToEdit?.price}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Catégorie</Label>
              <select
                id="category_id"
                name="category_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={productToEdit?.category_id || ""}
              >
                <option value="">Aucune catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Image du produit</Label>
              <div className="flex gap-4 items-start">
                {imageUrl ? (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border">
                    <Image 
                      src={imageUrl} 
                      alt="Aperçu" 
                      fill 
                      sizes="96px"
                      className="object-cover" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setImageUrl("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted/50">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                  <div className="text-xs text-muted-foreground">Ou collez une URL d'image existante :</div>
                  <Input 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock_alert">Seuil d'alerte</Label>
              <Input
                id="min_stock_alert"
                name="min_stock_alert"
                type="number"
                min="0"
                defaultValue={productToEdit?.min_stock_alert ?? 10}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description (Optionnel)</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={productToEdit?.description || ""}
              />
            </div>

            {!productToEdit && (
              <div className="space-y-4 col-span-2 border-t pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Stock initial</Label>
                  {userRole === "admin" && (
                    <RadioGroup 
                      value={targetBoutique} 
                      onValueChange={(val) => setTargetBoutique(val)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all" className="font-normal cursor-pointer">Toutes les boutiques</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="specific" id="specific" />
                        <Label htmlFor="specific" className="font-normal cursor-pointer">Boutique spécifique</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>

                {userRole === "admin" && targetBoutique === "specific" && (
                  <div className="space-y-2">
                    <Label htmlFor="boutique_select">Sélectionner la boutique</Label>
                    <select
                      id="boutique_select"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setTargetBoutique(e.target.value)}
                      value={targetBoutique === "specific" ? "" : targetBoutique}
                    >
                      <option value="" disabled>Choisir une boutique...</option>
                      {boutiques.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-3">
                  {userRole === "admin" && targetBoutique === "all" ? (
                    <div className="grid grid-cols-2 gap-3">
                      {boutiques.map((boutique) => (
                        <div key={boutique.id} className="space-y-1.5 p-3 rounded-lg border bg-muted/30">
                          <Label htmlFor={`qty-${boutique.id}`} className="text-xs font-medium px-1">
                            {boutique.name}
                          </Label>
                          <Input
                            id={`qty-${boutique.id}`}
                            type="number"
                            min="0"
                            placeholder="Quantité"
                            value={quantities[boutique.id] || ""}
                            onChange={(e) => setQuantities({
                              ...quantities,
                              [boutique.id]: parseInt(e.target.value) || 0
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (targetBoutique !== "specific" && (
                    <div className="space-y-2">
                      <Label htmlFor="single-qty">
                        Quantité en stock {userRole === "manager" ? `(Boutique: ${boutiques.find(b => b.id === userBoutiqueId)?.name})` : ""}
                        {userRole === "admin" && ` (Boutique: ${boutiques.find(b => b.id === targetBoutique)?.name})`}
                      </Label>
                      <Input
                        id="single-qty"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantities[userRole === "admin" ? targetBoutique : (userBoutiqueId || "")] || ""}
                        onChange={(e) => {
                          const bId = userRole === "admin" ? targetBoutique : userBoutiqueId;
                          if (bId && bId !== "specific" && bId !== "all") {
                            setQuantities({ ...quantities, [bId]: parseInt(e.target.value) || 0 });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {productToEdit ? "Mettre à jour" : "Créer le produit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
