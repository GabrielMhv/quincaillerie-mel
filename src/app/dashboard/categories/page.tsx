import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CategoryFormModal } from "@/components/categories/category-form-modal";
import { CategoryDeleteButton } from "@/components/categories/category-actions";
import { Tags, Sparkles, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default async function CategoriesPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(id)")
    .order("name");

  interface CategoryWithProducts {
    id: string;
    name: string;
    created_at: string;
    products?: { id: string }[];
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-row items-center justify-between gap-6 px-10 py-12 rounded-[3.5rem] bg-cyan-500/5 border border-cyan-500/10 relative overflow-hidden group shadow-premium">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
          <Tags className="h-40 w-40 text-cyan-600" />
        </div>
        <div className="space-y-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 mb-2">
            <Tags className="h-7 w-7" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-1">
            Organisation des{" "}
            <span className="text-cyan-500 italic">Catégories</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-muted-foreground font-medium italic leading-none">
              Structurez votre catalogue pour une navigation fluide
            </p>
          </div>
        </div>
        <div className="p-2 relative z-10">
          <CategoryFormModal />
        </div>
      </section>

      {/* Main List Area */}
      <section className="rounded-[3rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-8 border-b border-border/50 bg-muted/30 flex justify-between items-center">
          <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> Classification Active
          </h3>
          <div className="px-4 py-1.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black tracking-widest text-primary">
              Intelligence
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-16 bg-muted/10">
                <th className="px-8 text-left">Nom de la Catégorie</th>
                <th className="px-8 text-left">Impact Catalogue</th>
                <th className="px-8 text-left">Date Création</th>
                <th className="px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {categories?.map((category: CategoryWithProducts) => (
                <tr
                  key={category.id}
                  className="group hover:bg-primary/2 transition-all h-24"
                >
                  <td className="px-8">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-sm border border-border/50">
                        <Tags className="h-5 w-5" />
                      </div>
                      <p className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                        {category.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-8">
                    <Badge
                      variant="outline"
                      className="rounded-full px-4 py-1 text-[10px] font-black tracking-widest border-2 bg-primary/5 text-primary/80 border-primary/10 transition-colors"
                    >
                      {category.products?.length || 0} Produits Liés
                    </Badge>
                  </td>
                  <td className="px-8">
                    <p className="text-xs font-bold text-muted-foreground opacity-60">
                      {format(new Date(category.created_at), "PPP", {
                        locale: fr,
                      })}
                    </p>
                  </td>
                  <td className="px-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      {" "}
                      <CategoryFormModal category={category} />
                      <CategoryDeleteButton
                        id={category.id}
                        disabled={
                          category.products
                            ? category.products.length > 0
                            : false
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {!categories?.length && (
                <tr className="h-64">
                  <td colSpan={4} className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                      <LayoutGrid className="h-12 w-12" />
                      <p className="text-sm font-black tracking-widest">
                        Aucune catégorie répertoriée
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
