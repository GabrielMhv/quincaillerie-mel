import { createClient } from "@/lib/supabase/server";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { ProductFilters } from "@/components/products/product-filters";
import Image from "next/image";
import { ShoppingBag, Edit2, Trash2, Plus } from "lucide-react";
import MultiProductForm from "@/components/products/multi-product-form";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ProductsGridSkeleton } from "@/components/ui/skeleton";

export default async function DashboardProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <Suspense fallback={<ProductsGridSkeleton />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const searchQuery = searchParams.q as string | undefined;
  const categoryFilter = searchParams.category as string | undefined;

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
    redirect("/dashboard");
  }

  const canManageProducts =
    profile.role === "admin" || profile.role === "manager";

  // Fetch all boutiques for the product modal
  const { data: boutiques } = await supabase
    .from("boutiques")
    .select("*")
    .order("name");

  // Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch Products with Stock
  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(name),
      stocks(quantity)
    `,
    )
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`);
  }
  if (categoryFilter && categoryFilter !== "all") {
    query = query.eq("category_id", categoryFilter);
  }

  const { data: products, error } = await query;

  if (error) console.error("Products fetch error:", error);

  const processedProducts =
    products?.map((p) => ({
      ...p,
      totalStock:
        p.stocks?.reduce(
          (acc: number, s: { quantity: number | null }) =>
            acc + (s.quantity || 0),
          0,
        ) || 0,
    })) || [];

  // Simple stats for the header
  const totalProducts = processedProducts.length;
  const outOfStock = processedProducts.filter((p) => p.totalStock === 0).length;
  const lowStock = processedProducts.filter(
    (p) => p.totalStock > 0 && p.totalStock <= (p.min_stock_alert || 5),
  ).length;

  return (
    <div className="max-w-400 mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header & Stats Cards */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Catalogue Produits
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Gérez votre inventaire et vos prix de vente
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canManageProducts && (
              <ProductFormModal
                categories={categories || []}
                userRole={profile.role}
                userBoutiqueId={profile.boutique_id}
                boutiques={boutiques || []}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-[#064e3b] hover:bg-[#065f46] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="h-5 w-5" /> Ajouter un produit
                  </button>
                }
              />
            )}
            {canManageProducts && (
              <MultiProductForm
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-2 bg-[#064e3b] hover:bg-[#065f46] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 whitespace-nowrap"
                  >
                    Ajouter plusieurs
                  </button>
                }
                categories={categories || []}
                boutiques={boutiques || []}
                userRole={profile.role}
                userBoutiqueId={profile.boutique_id}
              />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Articles actifs",
              value: totalProducts,
              color: "text-blue-600 bg-blue-50/50",
              icon: ShoppingBag,
            },
            {
              label: "En rupture",
              value: outOfStock,
              color: "text-rose-600 bg-rose-50/50",
              icon: Trash2,
            },
            {
              label: "Stock faible",
              value: lowStock,
              color: "text-amber-600 bg-amber-50/50",
              icon: Edit2,
            },
            {
              label: "Catégories",
              value: categories?.length || 0,
              color: "text-emerald-600 bg-emerald-50/50",
              icon: Plus,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4"
            >
              <div
                className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm",
                  stat.color,
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
          <ProductFilters
            categories={categories || []}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
          />
        </div>
      </div>

      {/* Grid catalogue */}
      {processedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {processedProducts.map((product) => (
            <div
              key={product.id}
              data-testid="product-card"
              className="group bg-white dark:bg-slate-900 rounded-4xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 flex flex-col"
            >
              {/* Product Image Wrapper */}
              <div className="relative h-64 w-full bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                <Image
                  src={product.image_url || "/placeholder-product.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-4 py-2 rounded-2xl text-[13px] font-black border border-slate-100 dark:border-slate-800 shadow-sm">
                  {formatCurrency(product.price)}
                </div>

                {/* Stock Overlay */}
                <div className="absolute bottom-4 left-4">
                  <Badge
                    className={cn(
                      "px-3 py-1.5 rounded-xl border-none font-bold text-[10px] tracking-wider",
                      product.totalStock > 10
                        ? "bg-emerald-50 text-emerald-600"
                        : product.totalStock > 0
                          ? "bg-amber-50 text-amber-600"
                          : "bg-rose-50 text-rose-600",
                    )}
                  >
                    {product.totalStock} en stock
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 tracking-widest">
                    {product.category?.name || "Général"}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {canManageProducts && (
                      <ProductFormModal
                        categories={categories || []}
                        productToEdit={product}
                        userRole={profile.role}
                        userBoutiqueId={profile.boutique_id}
                        boutiques={boutiques || []}
                        trigger={
                          <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center border border-slate-100 dark:border-slate-800">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        }
                      />
                    )}
                  </div>

                  {canManageProducts && (
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                      trigger={
                        <button className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-32 space-y-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center">
          <div className="h-24 w-24 rounded-4xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
            <ShoppingBag className="h-12 w-12 opacity-50" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Aucun produit trouvé
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm font-medium">
              Nous n&apos;avons trouvé aucun article correspondant à vos
              critères de recherche.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
