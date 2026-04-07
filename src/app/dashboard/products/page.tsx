import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { ProductFormModal } from "@/components/products/product-form-modal";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import Image from "next/image";
import { Package, ShoppingBag, Search } from "lucide-react";

export default async function DashboardProductsPage(props: {
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
      <div className="flex flex-col items-center justify-center p-24 text-center space-y-4">
        <div className="p-6 rounded-full bg-rose-500/10 text-rose-600">
          <Package className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter">Accès Refusé</h2>
        <p className="text-muted-foreground max-w-md">
          Vous n&apos;avez pas les droits nécessaires pour consulter le
          catalogue produits.
        </p>
      </div>
    );
  }

  const canManageProducts =
    profile.role === "admin" || profile.role === "manager";

  // Fetch all boutiques for the product modal
  const { data: boutiques } = await supabase
    .from("boutiques")
    .select("*")
    .order("name");



  // Fetch Categories for the modal form
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch Products
  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Products fetch error:", error);
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-row items-center justify-between gap-6 px-10 py-12 rounded-[3.5rem] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden group shadow-premium">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
          <Package className="h-40 w-40 text-emerald-600" />
        </div>
        <div className="space-y-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-1">
            Gestion des <span className="text-emerald-500 italic">Produits</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-muted-foreground font-medium italic leading-none">
              {products?.length || 0} références en stock
            </p>
            {boutiqueSwitcherId && (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase shadow-xs"
              >
                Stock local
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {canManageProducts && (
            <ProductFormModal
              categories={categories || []}
              userRole={profile.role}
              userBoutiqueId={profile.boutique_id}
              boutiques={boutiques || []}
            />
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="rounded-[3rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-8 border-b border-border/50 bg-muted/30 flex justify-between items-center">
          <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
            <Package className="h-4 w-4" /> Inventaire Global
          </h3>
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
            />
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-16 bg-muted/10">
                <th className="px-8 text-left text-xs">Produit</th>
                <th className="px-8 text-left text-xs">Catégorie</th>
                <th className="px-8 text-left text-xs">Stock Alerte</th>
                <th className="px-8 text-left text-xs">Prix de Vente</th>
                <th className="px-8 text-right text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {products?.map((product) => (
                <tr
                  key={product.id}
                  className="group hover:bg-primary/2 transition-colors h-24"
                >
                  <td className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 relative rounded-2xl overflow-hidden border border-border/50 bg-muted shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Image
                          src={product.image_url || "/placeholder-product.jpg"}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-foreground truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-tighter truncate opacity-60">
                          Ref: {product.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8">
                    {product.category?.name ? (
                      <span className="px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-[10px] font-black tracking-widest border border-border/50">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/30 italic text-xs font-bold">
                        Sans catégorie
                      </span>
                    )}
                  </td>
                  <td className="px-8">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      <span className="font-bold text-muted-foreground">
                        {product.min_stock_alert} unités
                      </span>
                    </div>
                  </td>
                  <td className="px-8">
                    <span className="text-lg font-black text-primary tabular-nums">
                      {formatCurrency(product.price)}
                    </span>
                  </td>
                  <td className="px-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canManageProducts ? (
                        <>
                          <ProductFormModal
                            categories={categories || []}
                            productToEdit={product}
                            userRole={profile.role}
                            userBoutiqueId={profile.boutique_id}
                            boutiques={boutiques || []}
                          />
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </>
                      ) : (
                        <span className="text-[10px] font-black text-muted-foreground opacity-30">
                          Consultation
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr className="h-64">
                  <td colSpan={5} className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                      <ShoppingBag className="h-12 w-12" />
                      <p className="text-sm font-black tracking-widest">
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
