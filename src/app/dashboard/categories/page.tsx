import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CategoryFormModal } from "@/components/categories/category-form-modal";
import { CategoryDeleteButton } from "@/components/categories/category-actions";
import { LayoutGrid, Tags, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
    <div className="mx-auto max-w-350 space-y-8 p-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
          <Tags className="h-64 w-64 text-slate-900 dark:text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-slate-500">
                Organisation
              </span>
            </div>

            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestion des{" "}
              <span className="text-blue-600 italic underline decoration-blue-500/20 underline-offset-8">
                Catégories
              </span>
            </h1>

            <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
              Structurez votre catalogue pour une navigation fluide et une
              gestion simplifiée de vos produits.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <CategoryFormModal />
          </div>
        </div>
      </section>

      {/* Main List Area */}
      <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm text-slate-400">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white  tracking-wider">
                Classification Active
              </h3>
              <p className="text-[10px] font-bold text-slate-400  tracking-widest leading-none mt-1">
                Total: {categories?.length || 0} catégories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Sparkles className="h-3 w-3 text-blue-500" />
            <span className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 ">
              Optimisé
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 tracking-widest  border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-8 py-5 text-left font-black">
                  Nom de la Catégorie
                </th>
                <th className="px-8 py-5 text-left font-black">
                  Impact Catalogue
                </th>
                <th className="px-8 py-5 text-left font-black">
                  Date Création
                </th>
                <th className="px-8 py-5 text-right font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {categories?.map((category: CategoryWithProducts) => (
                <tr
                  key={category.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300"
                >
                  <td className="px-8 py-8 border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 group-hover:shadow-md transition-all duration-500 border border-slate-100 dark:border-slate-700">
                        <Tags className="h-6 w-6" />
                      </div>
                      <p className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors  leading-tight">
                        {category.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-8 border-slate-50 dark:border-slate-800">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {category.products?.length || 0}
                      </span>
                      <span className="text-[10px] font-black tracking-widest text-slate-400">
                        Produits
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-8 border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                        {format(new Date(category.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400  tracking-widest mt-0.5">
                        {format(new Date(category.created_at), "HH:mm", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right border-slate-50 dark:border-slate-800">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
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
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                      <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <LayoutGrid className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-black tracking-widest ">
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
