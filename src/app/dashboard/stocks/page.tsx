export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { StockEditor } from "@/components/products/stock-editor";
import { Badge } from "@/components/ui/badge";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { StockHistory } from "@/components/dashboard/stock-history";
import { AlertTriangle, Boxes, Plus } from "lucide-react";
import Image from "next/image";

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
    <div className="max-w-400 mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des Stocks
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isGlobalScope
              ? "Inventaire consolidé du réseau"
              : `État des stocks : ${currentBoutiqueName}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ProductFormModal
            categories={categories || []}
            userRole={role}
            userBoutiqueId={profile.boutique_id}
            boutiques={boutiques || []}
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 bg-[#064e3b] hover:bg-[#065f46] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95"
              >
                <Plus className="h-5 w-5" /> Ajouter un produit
              </button>
            }
          />
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider">
              Inventaire en temps réel
            </h3>
          </div>
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1 text-[11px] font-bold text-slate-500 border-slate-200"
          >
            {products?.length || 0} références
          </Badge>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest border-b border-slate-50 dark:border-slate-800 h-16 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-8 text-left sticky left-0 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md z-20 border-r border-slate-50 dark:border-slate-800 w-80">
                  Produit & Référence
                </th>
                {boutiques?.map((boutique) => (
                  <th
                    key={boutique.id}
                    className="px-8 text-center border-r border-slate-50 dark:border-slate-800 last:border-r-0 min-w-48"
                  >
                    {boutique.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {products?.map((product) => (
                <tr
                  key={product.id}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all h-28"
                >
                  <td className="px-8 sticky left-0 bg-white dark:bg-slate-900 backdrop-blur-md z-10 border-r border-slate-50 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-800 relative overflow-hidden border border-slate-100 dark:border-slate-700 shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-105">
                        <Image
                          src={product.image_url || "/placeholder-product.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate leading-tight">
                          {product.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black tracking-wider text-slate-400 dark:text-slate-500">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                            Alerte: {product.min_stock_alert}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {boutiques?.map((boutique) => {
                    const stockRecord = product.stocks?.find(
                      (s: { boutique_id: string; quantity: number }) =>
                        s.boutique_id === boutique.id,
                    );
                    const currentStock = stockRecord?.quantity || 0;
                    const isLow =
                      currentStock <= (product.min_stock_alert || 0);

                    return (
                      <td
                        key={`${product.id}-${boutique.id}`}
                        className="px-8 text-center border-r border-slate-50 dark:border-slate-800 last:border-r-0"
                      >
                        <div className="flex flex-col items-center gap-3">
                          {isLow && (
                            <Badge
                              variant="outline"
                              className="rounded-full px-3 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
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
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                      <Boxes className="h-12 w-12 text-slate-400" />
                      <p className="text-sm font-bold text-slate-500">
                        Aucun produit au catalogue
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des mouvements de stock */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider">
            Historique des mouvements
          </h3>
        </div>
        <StockHistory />
      </div>
    </div>
  );
}
