export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { StockEditor } from "@/components/products/stock-editor";
import { Badge } from "@/components/ui/badge";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { StockHistory } from "@/components/dashboard/stock-history";
import { AlertTriangle, Boxes, Plus, ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { StocksTableSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockTransferUI } from "@/components/stocks/stock-transfer-ui";

export default async function DashboardStocksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <Suspense fallback={<StocksTableSkeleton />}>
      <StocksContent searchParams={searchParams} />
    </Suspense>
  );
}

async function StocksContent({ searchParams }: { searchParams: any }) {
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
          AccÃ¨s hautement sÃ©curisÃ©
        </p>
        <p className="text-sm text-muted-foreground font-medium">
          RÃ©servÃ© au personnel autorisÃ© de la direction.
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

  // Fetch existing transfers
  const { data: transfers } = await supabase
    .from("stock_transfers")
    .select(`
      *,
      product:products(name),
      from_boutique:boutiques!stock_transfers_from_boutique_id_fkey(name),
      to_boutique:boutiques!stock_transfers_to_boutique_id_fkey(name)
    `)
    .order("created_at", { ascending: false });

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
              ? "Inventaire consolidÃ© du rÃ©seau"
              : `Ã‰tat des stocks : ${currentBoutiqueName}`}
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

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-64 md:w-96 grid-cols-2 rounded-2xl h-12 mb-8 bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="inventory" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Inventaire</TabsTrigger>
          <TabsTrigger value="transfers" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Transferts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="focus-visible:outline-none">
          <StockEditor
            products={products || []}
            boutiques={boutiques || []}
            currentBoutiqueId={filteredBoutiqueId}
          />
        </TabsContent>

        <TabsContent value="transfers" className="focus-visible:outline-none">
          <StockTransferUI transfers={transfers || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
