import { createClient } from "@/lib/supabase/server";
import { StockRequestTerminal } from "@/components/stocks/stock-request-terminal";
import { redirect } from "next/navigation";
import { Truck } from "lucide-react";

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
    <div className="space-y-12 max-w-350 mx-auto p-6 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
          <Truck className="h-64 w-64 text-slate-900 dark:text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-slate-500">
                Logistique Interne
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Caisse de{" "}
              <span className="text-orange-600 italic underline decoration-orange-500/20 underline-offset-8">
                Réapprovisionnement
              </span>
            </h1>

            <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
              Sélectionnez les articles dont votre point de vente a besoin pour
              maintenir un stock optimal.
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm overflow-hidden">
        <StockRequestTerminal
          currentBoutiqueId={boutiqueId || ""}
          userRole={profile?.role}
        />
      </div>
    </div>
  );
}
