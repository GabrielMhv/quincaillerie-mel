import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StoreFormModal } from "@/components/stores/store-form-modal";
import { MapPin, Building2, Sparkles, Globe } from "lucide-react";

export default async function StoresPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: stores } = await supabase
    .from("boutiques")
    .select("*")
    .order("name");

  interface Store {
    id: string;
    name: string;
    address: string | null;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Réseau de{" "}
            <span className="text-gradient leading-relaxed">Boutiques</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium italic">
            Gérez vos points de vente et leur présence géographique
          </p>
        </div>
        <StoreFormModal />
      </section>

      {/* Main List Area */}
      <section className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-10 border-b border-border/50 bg-muted/30 flex justify-between items-center">
          <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Maillage Territorial
          </h3>
          <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-black tracking-widest text-primary">
              Gestion Centralisée
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-16 bg-muted/10">
                <th className="px-10 text-left">Boutique</th>
                <th className="px-10 text-left">Localisation</th>
                <th className="px-10 text-right">Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {stores?.map((store: Store) => (
                <tr
                  key={store.id}
                  className="group hover:bg-primary/2 transition-all h-28"
                >
                  <td className="px-10">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-3xl bg-secondary/50 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-sm border border-border/50">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <p className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
                        {store.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-10">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-muted-foreground transition-colors group-hover:text-foreground">
                        {store.address || "Adresse non spécifiée"}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <StoreFormModal store={store} />
                    </div>
                  </td>
                </tr>
              ))}
              {!stores?.length && (
                <tr className="h-80">
                  <td colSpan={3} className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-5 opacity-20">
                      <Building2 className="h-16 w-16" />
                      <p className="text-lg font-black tracking-widest leading-none">
                        Aucun point de vente répertorié
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
