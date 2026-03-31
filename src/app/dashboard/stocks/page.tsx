export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import { StockEditor } from "@/components/products/stock-editor";
import { Badge } from "@/components/ui/badge";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { Sparkles, Package, AlertTriangle, Boxes } from "lucide-react";

export default async function DashboardStocksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueSwitcherId = searchParams.boutiqueId as string | undefined;

  const supabase = await createClient();

  // Enforce role-based access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, boutique_id")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    (profile.role !== "admin" &&
      profile.role !== "manager" &&
      profile.role !== "employee")
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-16 w-16 rounded-4xl bg-rose-500/10 flex items-center justify-center text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="text-xl font-black tracking-tighter italic">
          Accès hautement sécurisé
        </p>
        <p className="text-sm text-muted-foreground font-medium">
          Réservé au personnel autorisé de la direction.
        </p>
      </div>
    );
  }

  const role = profile?.role;
  const isGlobalScope = !boutiqueSwitcherId; // No boutique selected = Global
  const filteredBoutiqueId = boutiqueSwitcherId || null;

  // Fetch Boutiques (Filtered if a specific boutique is selected in URL)
  let boutiquesQuery = supabase.from("boutiques").select("*").order("name");

  if (filteredBoutiqueId) {
    boutiquesQuery = boutiquesQuery.eq("id", filteredBoutiqueId);
  }

  const { data: boutiques } = await boutiquesQuery;

  // Fetch Products with their stocks
  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      *,
      stocks(boutique_id, quantity)
    `,
    )
    .order("name");

  if (error) console.error("Error fetching products:", error);

  // Fetch categories for the modal
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch current boutique name for display if filtered
  let currentBoutiqueName = "";
  if (filteredBoutiqueId) {
    const { data: bData } = await supabase
      .from("boutiques")
      .select("name")
      .eq("id", filteredBoutiqueId)
      .single();
    currentBoutiqueName = bData?.name || "";
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
            Contrôle des{" "}
            <span className="text-gradient leading-relaxed">Stocks</span>
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-lg text-muted-foreground font-medium italic">
              {isGlobalScope
                ? "Vue panoramique sur l'ensemble de l'inventaire"
                : `Surveillance active : ${currentBoutiqueName}`}
            </p>
            {boutiqueSwitcherId && (
              <Badge
                variant="outline"
                className="bg-orange-500/10 text-orange-600 border-orange-500/20 px-3 py-1 rounded-full font-black text-[10px] tracking-widest"
              >
                Unité : {currentBoutiqueName}
              </Badge>
            )}
          </div>
        </div>
        {(role === "admin" || role === "manager") && (
          <ProductFormModal
            categories={categories || []}
            userRole={role}
            userBoutiqueId={profile.boutique_id}
            boutiques={boutiques || []}
          />
        )}
      </section>

      {/* Main Table Area */}
      <section className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-10 border-b border-border/50 bg-muted/30 flex justify-between items-center">
          <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
            <Boxes className="h-4 w-4" /> Matrice d&apos;Inventaire
          </h3>
          <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-black tracking-widest text-primary italic">
              Sync. Temps-Réel
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-16 bg-muted/10">
                <th className="px-10 text-left sticky left-0 bg-muted/10 backdrop-blur-md z-20 border-r border-border/30 w-72">
                  Produit & Unité
                </th>
                {boutiques?.map((boutique) => (
                  <th
                    key={boutique.id}
                    className="px-10 text-center border-r border-border/30 last:border-r-0 min-w-[220px]"
                  >
                    {boutique.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {products?.map((product) => (
                <tr
                  key={product.id}
                  className="group hover:bg-primary/2 transition-all h-32 border-none"
                >
                  <td className="px-10 sticky left-0 bg-card/90 backdrop-blur-md z-10 border-r border-border/30 group-hover:bg-primary/[0.03] transition-colors">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-3xl bg-secondary/30 relative overflow-hidden border border-border/50 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                        <img
                          src={product.image_url || "/placeholder-product.jpg"}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="font-black text-lg tracking-tight truncate group-hover:text-primary transition-colors leading-none">
                          {product.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-black tracking-widest bg-emerald-500/5 text-emerald-600 border-emerald-500/10 px-2 py-0.5 rounded-full italic"
                          >
                            {formatCurrency(product.price)}
                          </Badge>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/5 border border-rose-500/10 text-[9px] font-black text-rose-600 tracking-widest italic">
                            Alerte: {product.min_stock_alert}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  {boutiques?.map((boutique) => {
                    const stockRecord = product.stocks?.find(
                      (s: any) => s.boutique_id === boutique.id,
                    );
                    const currentStock = stockRecord?.quantity || 0;
                    const isLow =
                      currentStock <= (product.min_stock_alert || 0);

                    return (
                      <td
                        key={`${product.id}-${boutique.id}`}
                        className="px-10 text-center border-r border-border/30 last:border-r-0"
                      >
                        <div className="flex flex-col items-center gap-4">
                          {isLow && (
                            <Badge
                              variant="outline"
                              className="rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse shadow-[0_0_15px_-5px_rgba(244,63,94,0.4)]"
                            >
                              Stock Critique
                            </Badge>
                          )}
                          <StockEditor
                            productId={product.id}
                            boutiqueId={boutique.id}
                            initialStock={currentStock}
                            disabled={
                              profile.role === "employee" ||
                              (profile.role === "manager" &&
                                boutique.id !== profile.boutique_id)
                            }
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr className="h-80">
                  <td
                    colSpan={(boutiques?.length || 0) + 1}
                    className="text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-5 opacity-20">
                      <Boxes className="h-16 w-16" />
                      <p className="text-lg font-black tracking-widest text-center">
                        Aucun produit au catalogue
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
