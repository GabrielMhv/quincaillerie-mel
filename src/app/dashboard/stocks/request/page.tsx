import { createClient } from "@/lib/supabase/server";
import { StockRequestTerminal } from "@/components/stocks/stock-request-terminal";
import { redirect } from "next/navigation";

export default async function StockRequestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, boutique_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "manager") {
    redirect("/dashboard");
  }

  const boutiqueId = profile?.boutique_id;

  if (!boutiqueId && profile?.role !== "admin") {
    return (
      <div className="p-12 text-center italic text-muted-foreground">
        Veuillez être assigné à une boutique pour demander du stock.
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-6 pt-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Caisse de{" "}
            <span className="text-gradient leading-relaxed">
              Réapprovisionnement
            </span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium italic">
            Sélectionnez les articles dont votre point de vente a besoin
          </p>
        </div>
      </section>

      <div className="flex-1 min-h-0">
        <StockRequestTerminal currentBoutiqueId={boutiqueId || ""} />
      </div>
    </div>
  );
}
