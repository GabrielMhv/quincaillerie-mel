"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useBranding } from "@/components/providers/branding-provider";
import {
  Save,
  Loader2,
  Globe,
  Sparkles,
  Building2,
  Mail,
  Phone,
  MapPin,
  Settings2,
  MessageCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { refreshSettings } = useBranding();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    linkedin: "",
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "branding")
          .single();

        if (error) {
          if (error.code === "PGRST116" || error.status === 404) {
            return;
          } else {
            throw error;
          }
        }

        if (data?.value) {
          setSettings(data.value);
        }
      } catch (error: unknown) {
        console.error("Error fetching settings:", error);
        toast.error("Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "branding", value: settings }, { onConflict: "key" });

      if (error) throw error;

      // Update global branding context
      await refreshSettings();

      toast.success("Configurations sauvegardées avec succès");
    } catch (error: unknown) {
      console.error("Error saving settings:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="text-xs font-black tracking-widest text-muted-foreground/40 italic">
            Initialisation du Centre de Contrôle...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-row items-center justify-between gap-6 px-10 py-12 rounded-[3.5rem] bg-slate-500/5 border border-slate-500/10 relative overflow-hidden group shadow-premium">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
          <Settings2 className="h-40 w-40 text-slate-600" />
        </div>
        <div className="space-y-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-600 mb-2">
            <Settings2 className="h-7 w-7" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-1">
            Configurations{" "}
            <span className="text-slate-500 italic">Système</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-muted-foreground font-medium italic leading-none">
              Pilotez l&apos;identité et les paramètres globaux de votre
              plateforme.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="relative">
        <div className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
          <div className="p-10 border-b border-border/50 bg-muted/30 flex justify-between items-center">
            <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Matrice d&apos;Identité
            </h3>
            <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black tracking-widest text-primary italic">
                Diffusion Globale
              </span>
            </div>
          </div>

          <div className="p-10 lg:p-14 space-y-10">
            {/* Corporate Identity */}
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="space-y-2">
                <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary/60" /> Marque
                </h4>
                <p className="text-sm text-muted-foreground font-medium italic">
                  Le nom et la vision de votre établissement.
                </p>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    NOM DE L&apos;ENTREPRISE
                  </Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                    placeholder="Ex: Ets La Championne"
                    className="h-14 px-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold text-lg"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="description"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    DESCRIPTION STRATÉGIQUE
                  </Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) =>
                      setSettings({ ...settings, description: e.target.value })
                    }
                    placeholder="Ex: Votre partenaire pour tous vos travaux."
                    className="min-h-30 px-6 py-4 rounded-3xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-medium leading-relaxed italic"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/20 w-full" />

            {/* Contact Vectors */}
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="space-y-2">
                <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary/60" /> Présence
                </h4>
                <p className="text-sm text-muted-foreground font-medium italic">
                  Comment vos clients peuvent vous joindre.
                </p>
              </div>
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    EMAIL DE CONTACT
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) =>
                        setSettings({ ...settings, email: e.target.value })
                      }
                      placeholder="contact@example.com"
                      className="h-14 pl-14 pr-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="phone"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    LIGNE TÉLÉPHONIQUE
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) =>
                        setSettings({ ...settings, phone: e.target.value })
                      }
                      placeholder="+228 00 00 00 00"
                      className="h-14 pl-14 pr-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 grid gap-2">
                  <Label
                    htmlFor="address"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    ADRESSE DU SIÈGE SOCIAL
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-5 h-4 w-4 text-muted-foreground/40" />
                    <Textarea
                      id="address"
                      value={settings.address}
                      onChange={(e) =>
                        setSettings({ ...settings, address: e.target.value })
                      }
                      placeholder="Ex: Lomé, Togo"
                      className="min-h-25 pl-14 pr-6 py-4 rounded-3xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/20 w-full" />

            {/* Social Vectors */}
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="space-y-2">
                <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary/60" /> Réseaux
                  Sociaux
                </h4>
                <p className="text-sm text-muted-foreground font-medium italic">
                  Votre visibilité sur les plateformes digitales.
                </p>
              </div>
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                <div className="grid gap-2">
                  <Label
                    htmlFor="facebook"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    FACEBOOK URL
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="facebook"
                      value={settings.facebook}
                      onChange={(e) =>
                        setSettings({ ...settings, facebook: e.target.value })
                      }
                      placeholder="https://facebook.com/..."
                      className="h-14 pl-14 pr-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="instagram"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    INSTAGRAM URL
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="instagram"
                      value={settings.instagram}
                      onChange={(e) =>
                        setSettings({ ...settings, instagram: e.target.value })
                      }
                      placeholder="https://instagram.com/..."
                      className="h-14 pl-14 pr-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="whatsapp"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    WHATSAPP URL / NUMÉRO
                  </Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="whatsapp"
                      value={settings.whatsapp}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp: e.target.value })
                      }
                      placeholder="https://wa.me/228..."
                      className="h-14 pl-14 pr-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="linkedin"
                    className="text-[10px] font-black tracking-widest text-muted-foreground/60 ml-1"
                  >
                    LINKEDIN URL
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                      id="linkedin"
                      value={settings.linkedin}
                      onChange={(e) =>
                        setSettings({ ...settings, linkedin: e.target.value })
                      }
                      placeholder="https://linkedin.com/..."
                      className="h-14 pl-14 pr-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 border-t border-border/50 bg-muted/30 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="h-16 px-10 rounded-4xl bg-primary text-primary-foreground font-black tracking-tighter text-lg hover:scale-105 transition-all shadow-[0_20px_40px_-15px_rgba(var(--primary),0.3)]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-3 h-5 w-5" />
                  Sauvegarder les Changements
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
