"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Edit2, Loader2, Plus, Upload, X } from "lucide-react";
import { Product, UserRole, Boutique } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { convertToWebP } from "@/lib/image-utils";
import { createProduct, updateProduct } from "@/app/actions/products";
import { productSchema } from "@/lib/validations/product";

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
  trigger?: React.ReactElement;
}

export function ProductFormModal({
  categories,
  productToEdit,
  userRole,
  userBoutiqueId,
  boutiques,
  trigger,
}: ProductFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(productToEdit?.image_url || "");

  // Stock management state
  const [targetBoutique, setTargetBoutique] = useState<string | "all">(
    userRole === "admin" ? "all" : userBoutiqueId || "",
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast check for Cloudinary Env config
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      "quincaillerie_preset";

    if (!cloudName) {
      toast.error(
        "Configuration Cloudinary manquante. Utilisez une URL image directement.",
      );
      return;
    }

    setIsUploading(true);

    try {
      // Optmisation : Conversion en WebP avant upload
      const webpBlob = await convertToWebP(file);
      const webpFile = new File(
        [webpBlob],
        file.name.replace(/\.[^/.]+$/, "") + ".webp",
        { type: "image/webp" },
      );

      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

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
    const rawData = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      category_id: formData.get("category_id") as string,
      description: formData.get("description") as string,
      min_stock_alert: parseInt(formData.get("min_stock_alert") as string) || 0,
      image_url: imageUrl || null,
    };

    // Validation Zod avant l'action
    const validation = productSchema.partial().safeParse(rawData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      if (productToEdit) {
        // UPDATE via Server Action
        const result = await updateProduct(productToEdit.id, rawData);
        if (result.error) throw new Error(result.error);
        toast.success("Produit mis à jour avec succès");
      } else {
        // CREATE via Server Action
        const stocks: { boutique_id: string; quantity: number }[] = [];
        if (userRole === "admin" && targetBoutique === "all") {
          boutiques.forEach((b) => {
            stocks.push({
              boutique_id: b.id,
              quantity: quantities[b.id] || 0,
            });
          });
        } else {
          const bId = userRole === "admin" ? targetBoutique : userBoutiqueId;
          if (bId && bId !== "all") {
            stocks.push({
              boutique_id: bId,
              quantity: quantities[bId] || 0,
            });
          }
        }

        const createData = {
          ...rawData,
          category_id: rawData.category_id || "",
          stocks,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await createProduct(createData as any);
        if (result.error) throw new Error(result.error);
        toast.success("Produit créé avec succès");
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : productToEdit ? (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          Éditer
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="gap-2" />}>
          <Plus className="h-4 w-4" />
          Nouveau Produit
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-[#0f172a] border-slate-800 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Left Panel: Preview & Image */}
          <div className="w-full md:w-1/3 bg-[#1e293b]/50 p-8 border-r border-slate-800 flex flex-col items-center justify-start space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tighter">
                {productToEdit ? "Édition" : "Nouveau"}
              </h2>
              <p className="text-xs text-slate-400 font-medium tracking-widest">
                Informations Visuelles
              </p>
            </div>

            <div className="relative group w-full aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
              <label className="absolute inset-0 z-10 cursor-pointer">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
                {!imageUrl && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500 group-hover:text-emerald-400 transition-colors animate-in fade-in zoom-in duration-300">
                    <Upload className="h-10 w-10 stroke-1" />
                    <span className="text-xs font-bold tracking-widest text-center px-4">
                      Importer un fichier
                    </span>
                  </div>
                )}
              </label>

              {imageUrl && (
                <div className="absolute inset-0">
                  <Image
                    src={imageUrl}
                    alt="Aperçu"
                    fill
                    className="object-cover transition-transform group-hover:scale-110 duration-700"
                  />
                  {/* Overlay on hover - Pointer events none except for the delete button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20 pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                        <Edit2 className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-black text-white tracking-widest">
                        Changer
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-4 right-4 rounded-xl h-10 w-10 shadow-2xl z-30 pointer-events-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImageUrl("");
                      }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 ml-1">
                  URL Directe
                </Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.com/..."
                  className="bg-slate-900/50 border-slate-700 rounded-xl text-xs"
                />
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] leading-relaxed text-emerald-500/80 font-medium">
                Conseil : Utilisez une image carrée (1:1) pour un meilleur rendu
                sur le catalogue.
              </div>
            </div>
          </div>

          {/* Right Panel: Form Fields */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-black tracking-wider text-slate-400"
                  >
                    Désignation du produit
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={productToEdit?.name}
                    required
                    className="bg-slate-900 border-slate-700 rounded-2xl h-12 text-base font-bold focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Ex: Ciment 50kg, Paquet de vis..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-xs font-black tracking-wider text-slate-400"
                  >
                    Prix de vente (FCFA)
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={productToEdit?.price}
                      required
                      className="bg-slate-900 border-slate-700 rounded-2xl h-12 pl-4 pr-12 text-base font-black text-emerald-400"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500">
                      CFA
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="category_id"
                    className="text-xs font-black tracking-wider text-slate-400"
                  >
                    Catégorie
                  </Label>
                  <select
                    id="category_id"
                    name="category_id"
                    className="flex h-12 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
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

                <div className="space-y-2">
                  <Label
                    htmlFor="min_stock_alert"
                    className="text-xs font-black tracking-wider text-slate-400"
                  >
                    Alerte stock bas
                  </Label>
                  <Input
                    id="min_stock_alert"
                    name="min_stock_alert"
                    type="number"
                    min="0"
                    defaultValue={productToEdit?.min_stock_alert ?? 10}
                    className="bg-slate-900 border-slate-700 rounded-2xl h-12 font-bold"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label
                    htmlFor="description"
                    className="text-xs font-black tracking-wider text-slate-400"
                  >
                    Description complémentaire
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={2}
                    defaultValue={productToEdit?.description || ""}
                    className="bg-slate-900 border-slate-700 rounded-2xl text-sm p-4 min-h-25"
                    placeholder="Détails techniques, dimensions, marque..."
                  />
                </div>

                {!productToEdit && (
                  <div className="space-y-6 col-span-2 bg-slate-900/50 p-6 rounded-4xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-black tracking-widest text-emerald-500">
                        Stock de départ
                      </Label>
                      {userRole === "admin" && (
                        <RadioGroup
                          value={targetBoutique}
                          onValueChange={(val) => setTargetBoutique(val)}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="all"
                              id="all"
                              className="border-emerald-500 text-emerald-500"
                            />
                            <Label
                              htmlFor="all"
                              className="text-[10px] font-black cursor-pointer"
                            >
                              Global
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="specific"
                              id="specific"
                              className="border-emerald-500 text-emerald-500"
                            />
                            <Label
                              htmlFor="specific"
                              className="text-[10px] font-black cursor-pointer"
                            >
                              Unique
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {userRole === "admin" && targetBoutique === "all" ? (
                        <div className="grid grid-cols-2 gap-4">
                          {boutiques.map((boutique) => (
                            <div key={boutique.id} className="relative group">
                              <Label className="absolute -top-4 left-4 px-2 text-[8px] font-black text-slate-500 z-10">
                                {boutique.name}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={quantities[boutique.id] || ""}
                                onChange={(e) =>
                                  setQuantities({
                                    ...quantities,
                                    [boutique.id]:
                                      parseInt(e.target.value) || 0,
                                  })
                                }
                                className="bg-slate-950/50 border-slate-700 rounded-xl h-11 pt-2 font-bold focus:border-emerald-500"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userRole === "admin" &&
                            targetBoutique === "specific" && (
                              <select
                                className="flex h-12 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm font-bold"
                                onChange={(e) =>
                                  setTargetBoutique(e.target.value)
                                }
                                value={
                                  targetBoutique === "specific"
                                    ? ""
                                    : targetBoutique
                                }
                              >
                                <option value="" disabled>
                                  Choisir la boutique...
                                </option>
                                {boutiques.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          {(userRole !== "admin" ||
                            (targetBoutique !== "specific" &&
                              targetBoutique !== "all")) && (
                            <div className="relative">
                              <Label className="text-[10px] font-black text-slate-500 mb-2 block">
                                Quantité initiale (
                                {boutiques.find(
                                  (b) =>
                                    b.id ===
                                    (userRole === "admin"
                                      ? targetBoutique
                                      : userBoutiqueId),
                                )?.name || "Stock"}
                                )
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Saisir la quantité..."
                                value={
                                  quantities[
                                    userRole === "admin"
                                      ? targetBoutique
                                      : userBoutiqueId || ""
                                  ] || ""
                                }
                                onChange={(e) => {
                                  const bId =
                                    userRole === "admin"
                                      ? targetBoutique
                                      : userBoutiqueId;
                                  if (
                                    bId &&
                                    bId !== "specific" &&
                                    bId !== "all"
                                  ) {
                                    setQuantities({
                                      ...quantities,
                                      [bId]: parseInt(e.target.value) || 0,
                                    });
                                  }
                                }}
                                className="bg-slate-950/50 border-slate-700 rounded-2xl h-14 text-xl font-black text-center focus:border-emerald-500"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl px-8 font-bold text-slate-400 hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl px-10 h-12 font-black shadow-xl shadow-emerald-900/40 transition-all active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : productToEdit ? (
                    "Mettre à jour"
                  ) : (
                    "Créer le produit"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
