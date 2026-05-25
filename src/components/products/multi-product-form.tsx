"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { convertToWebP } from "@/lib/image-utils";

interface Props {
  categories: { id: string; name: string }[];
  boutiques: { id: string; name: string }[];
  userRole: string;
  userBoutiqueId: string | null;
  trigger?: React.ReactElement;
}

type Stock = { boutique_id: string; quantity: number };

interface Row {
  name: string;
  price: string;
  category_id: string;
  description: string;
  min_stock_alert: string;
  image_url: string;
  stocks: Stock[];
  uploading: boolean;
}

function createEmptyRow(): Row {
  return {
    name: "",
    price: "0",
    category_id: "",
    description: "",
    min_stock_alert: "10",
    image_url: "",
    stocks: [],
    uploading: false,
  };
}

export default function MultiProductForm({ categories, boutiques, userRole, userBoutiqueId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>(() => [createEmptyRow()]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((r) => [...r, createEmptyRow()]);
  }

  function removeRow(idx: number) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  async function submitAll() {
    setLoading(true);
    try {
      const results: { ok: boolean; error?: string }[] = [];
      for (const row of rows) {
        const input = {
          name: row.name,
          price: Number(row.price),
          category_id: row.category_id || "",
          description: row.description,
          min_stock_alert: Number(row.min_stock_alert) || 0,
          image_url: row.image_url || null,
          stocks: row.stocks || [],
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (createProduct as any)(input);
        if (res?.error) results.push({ ok: false, error: res.error });
        else results.push({ ok: true });
      }

      const failed = results.filter((r) => !r.ok);
      if (failed.length) {
        toast.error(`${failed.length} création(s) ont échoué`);
      } else {
        toast.success("Tous les produits ont été créés");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Multi add error:", err);
      toast.error("Erreur lors de la création des produits");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger render={<Button className="gap-2" />}>
          <Plus className="h-4 w-4" />Ajouter plusieurs
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-[#0f172a] border-slate-800 text-white shadow-2xl">
        <div className="flex flex-col gap-4 p-6">
          {rows.map((row, idx) => (
            <div key={idx} className="flex flex-col md:flex-row h-full max-h-[90vh] bg-transparent rounded-2xl border border-slate-800 overflow-hidden">
              <div className="w-full md:w-1/3 bg-[#1e293b]/50 p-6 flex flex-col items-center justify-start space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-black tracking-tighter">{row.name || `Produit ${idx + 1}`}</h3>
                  <p className="text-xs text-slate-400 font-medium tracking-widest">Informations Visuelles</p>
                </div>

                <div className="relative group w-full aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
                  <label className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center">
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        updateRow(idx, { uploading: true });
                        try {
                          const webp = await convertToWebP(file);
                          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "quincaillerie_preset";
                          if (!cloudName) throw new Error("Cloudinary not configured");
                          const form = new FormData();
                          form.append("file", new File([webp], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" }));
                          form.append("upload_preset", uploadPreset);
                          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
                          if (!res.ok) throw new Error("Upload failed");
                          const data = await res.json();
                          updateRow(idx, { image_url: data.secure_url });
                          toast.success("Image uploadée");
                        } catch (err) {
                          console.error("Upload error", err);
                          toast.error("Échec upload image");
                        } finally {
                          updateRow(idx, { uploading: false });
                        }
                      }}
                    />
                    {!row.image_url && (
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Plus className="h-8 w-8" />
                        <span className="text-xs font-bold">Importer une image</span>
                      </div>
                    )}
                  </label>

                  {row.image_url && <img src={row.image_url} alt={row.name || "aperçu"} className="object-cover w-full h-full" />}
                </div>

                <div className="w-full space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 ml-1">URL Directe</Label>
                  <Input value={row.image_url} onChange={(e) => updateRow(idx, { image_url: e.target.value })} placeholder="https://images.com/..." className="bg-slate-900/50 border-slate-700 rounded-xl text-xs" />
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <Label className="text-xs font-black tracking-wider text-slate-400">Désignation du produit</Label>
                      <Input value={row.name} onChange={(e) => updateRow(idx, { name: e.target.value })} required className="h-12" />
                    </div>

                    <div>
                      <Label className="text-xs font-black tracking-wider text-slate-400">Prix de vente (FCFA)</Label>
                      <Input type="number" value={row.price} onChange={(e) => updateRow(idx, { price: e.target.value })} className="h-12" />
                    </div>

                    <div>
                      <Label className="text-xs font-black tracking-wider text-slate-400">Catégorie</Label>
                      <select value={row.category_id} onChange={(e) => updateRow(idx, { category_id: e.target.value })} className="h-12 rounded-2xl w-full">
                        <option value="">Aucune catégorie</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-black tracking-wider text-slate-400">Alerte stock bas</Label>
                      <Input type="number" value={row.min_stock_alert} onChange={(e) => updateRow(idx, { min_stock_alert: e.target.value })} className="h-12" />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs font-black tracking-wider text-slate-400">Description complémentaire</Label>
                      <Textarea value={row.description} onChange={(e) => updateRow(idx, { description: e.target.value })} className="min-h-24" />
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-black tracking-widest text-emerald-500">Stock de départ</Label>
                      <Button variant="destructive" size="icon" onClick={() => removeRow(idx)}>
                        <Trash2 />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {userRole === "admin" ? (
                        boutiques.map((b) => (
                          <div key={b.id} className="flex items-center gap-3">
                            <div className="flex-1 text-sm">{b.name}</div>
                            <Input
                              type="number"
                              className="w-28"
                              value={String(row.stocks?.find((s) => s.boutique_id === b.id)?.quantity ?? '')}
                              onChange={(e) => {
                                const qty = Number(e.target.value) || 0;
                                const nextStocks: Stock[] = (row.stocks || []).filter((s) => s.boutique_id !== b.id);
                                nextStocks.push({ boutique_id: b.id, quantity: qty });
                                updateRow(idx, { stocks: nextStocks });
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 text-sm">Boutique locale</div>
                          <Input
                            type="number"
                            className="w-28"
                            value={String(row.stocks?.find((s) => s.boutique_id === userBoutiqueId)?.quantity ?? '')}
                            onChange={(e) => {
                              const qty = Number(e.target.value) || 0;
                              const bId = userBoutiqueId || "";
                              const nextStocks: Stock[] = (row.stocks || []).filter((s) => s.boutique_id !== bId);
                              if (bId) nextStocks.push({ boutique_id: bId, quantity: qty });
                              updateRow(idx, { stocks: nextStocks });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <Button onClick={addRow} variant="ghost">
              <Plus /> Ajouter une ligne
            </Button>
          </div>

          <div className="flex justify-end gap-3 p-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitAll} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Créer tous'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
