import { createClient } from "@/lib/supabase/server";
import { POSTerminal } from "@/components/pos/pos-terminal";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShoppingCart, Store } from "lucide-react";

export default async function POSPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("boutique_id, role")
    .eq("id", user.id)
    .single();

  const finalBoutiqueId =
    profile?.role === "admin" && boutiqueSwitcherId
      ? boutiqueSwitcherId
      : profile?.boutique_id;

  // Fetch boutique name
  let boutiqueName = "";
  if (finalBoutiqueId) {
    const { data: bData } = await supabase
      .from("boutiques")
      .select("name")
      .eq("id", finalBoutiqueId)
      .single();
    boutiqueName = bData?.name || "Boutique";
  }

  if (!finalBoutiqueId) {
    return (
      <div className="flex h-[70vh] items-center justify-center p-12 bg-card/50 backdrop-blur-xl rounded-[4rem] border border-dashed border-primary/20 animate-in fade-in duration-1000">
        <div className="text-center max-w-lg space-y-6">
          <div className="h-20 w-20 rounded-[2.5rem] bg-orange-500/10 flex items-center justify-center text-orange-600 mx-auto">
            <Store className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter">
              Sélection requise
            </h2>
            <p className="text-muted-foreground font-medium leading-relaxed italic">
              Pour activer le terminal de vente, veuillez sélectionner un point
              de vente dans le menu supérieur.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest italic">
            <Sparkles className="h-3.5 w-3.5" /> Système de caisse directe
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Terminal de{" "}
            <span className="text-gradient leading-relaxed">Vente</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-secondary/50 border border-border/50 shadow-sm">
              <Store className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-sm font-black tracking-tight">
                {boutiqueName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium italic">
              Saisie des transactions en temps réel
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-4 p-4 rounded-3xl bg-card border border-border/50 shadow-sm">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground/40 tracking-widest italic">
              Prêt pour l&apos;encaissement
            </p>
            <p className="text-sm font-bold">Session active</p>
          </div>
        </div>
      </section>

      {/* POS Terminal Wrapper */}
      <div className="flex-1 min-h-150 rounded-[3rem] overflow-hidden border border-border/50 shadow-premium bg-card/40 backdrop-blur-md">
        <POSTerminal boutiqueId={finalBoutiqueId} />
      </div>
    </div>
  );
}
