import { createClient } from "@/lib/supabase/server";
import { POSTerminal } from "@/components/pos/pos-terminal";
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
      <section className="flex flex-row items-center justify-between gap-6 px-10 py-12 rounded-[3.5rem] bg-orange-500/5 border border-orange-500/10 relative overflow-hidden group shadow-premium">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
          <ShoppingCart className="h-40 w-40 text-orange-600" />
        </div>
        <div className="space-y-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 mb-2">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-1">
            Terminal de{" "}
            <span className="text-orange-500 italic">Vente (POS)</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-sm">
              <Store className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-sm font-black tracking-tight text-orange-700">
                {boutiqueName}
              </span>
            </div>
            <p className="text-lg text-muted-foreground font-medium italic leading-none">
              Saisie des transactions en temps réel
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-4 p-6 rounded-3xl bg-secondary/30 backdrop-blur-md border border-border/10 shadow-lg relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-orange-600/60 tracking-widest uppercase leading-none mb-1">
              Prêt pour l&apos;encaissement
            </p>
            <p className="text-sm font-bold">Session Directe Active</p>
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
