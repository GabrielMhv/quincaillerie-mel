"use client";

import { Suspense, useState, useEffect } from "react";
import PublicLayout from "@/components/layout/public-layout";
import { ProductGrid } from "@/components/products/product-grid";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Hammer, Warehouse } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Product, Category } from "@/types";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const search = searchParams.get("q") || "";
  const categoryId = searchParams.get("category") || "";
  const boutiqueId = searchParams.get("boutiqueId") || "";
  const minPrice = parseInt(searchParams.get("min") || "0");
  const maxPrice = parseInt(searchParams.get("max") || "0");
  const inStock = searchParams.get("stock") === "true";

  const [localSearch, setLocalSearch] = useState(search);

  // Sync local search with URL param
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      // Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      setCategories(catData || []);

      // Products Query
      let query = supabase.from("products").select(`
          *,
          category:categories(name),
          stocks!inner(id, boutique_id, quantity)
       `);

      if (search) query = query.ilike("name", `%${search}%`);
      if (categoryId) query = query.eq("category_id", categoryId);
      if (boutiqueId) query = query.eq("stocks.boutique_id", boutiqueId);
      if (inStock) query = query.gt("stocks.quantity", 0);
      if (minPrice > 0) query = query.gte("price", minPrice);
      if (maxPrice > 0) query = query.lte("price", maxPrice);

      const { data: prodData } = await query.order("name");
      setProducts((prodData as unknown as Product[]) || []);
      setIsLoading(false);
    }
    fetchData();
  }, [search, categoryId, boutiqueId, inStock, minPrice, maxPrice, supabase]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/products?${params.toString()}`);
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen pb-40 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Ambient Visual Layers */}
      <div className="hidden lg:block absolute top-0 right-[-5%] w-250 h-250 bg-primary/5 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
      <div className="hidden lg:block absolute bottom-[-10%] left-[-10%] w-200 h-200 bg-blue-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.08] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-24 lg:pt-36">
        {/* Immersive Showroom Hero */}
        <div className="relative mb-8 md:mb-16 lg:mb-32 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 text-center lg:text-left">
          <div className="max-w-4xl space-y-3 sm:space-y-4 md:space-y-6 mx-auto lg:mx-0">
            <div className="hidden lg:inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black tracking-widest shadow-sm">
              <Warehouse className="h-3.5 w-3.5" /> Inventaire certifié A+
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tight leading-none md:leading-[0.9] text-slate-900 dark:text-white mx-auto lg:mx-0">
              Showroom <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-500 to-green-600 bg-size-[200%_auto] animate-gradient">
                Equipements.
              </span>
            </h1>
            <p className="hidden lg:block text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
              Explorez notre sélection rigoureuse d&apos;outillage professionnel
              et de matériaux haut de gamme, sourcés pour la réussite de vos
              projets au Togo.
            </p>
          </div>

          {/* Quick Search Overlay */}
          <div className="max-w-2xl mx-auto relative mt-8">
            <div className="relative bg-white dark:bg-card h-14 w-full rounded-full border border-slate-200/50 dark:border-white/5 flex items-center shadow-sm hover:shadow-md transition-shadow duration-300">
              <Search className="ml-5 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Lancer une recherche..."
                className="border-none bg-transparent shadow-none focus-visible:ring-0 text-[15px] font-medium h-full px-4 placeholder:text-slate-400 placeholder:font-normal flex-1"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    updateFilters({ q: (e.target as HTMLInputElement).value });
                }}
              />
            </div>
          </div>
        </div>

        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative px-4 lg:px-0 mt-8 lg:mt-16">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 xl:w-72 shrink-0">
            {/* Mobile Filter Sidebar Drawer (Hidden on Desktop) */}
            <div className="lg:hidden mb-6 flex items-center justify-between px-2">
              <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
                Catalogue
              </h3>
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      className="rounded-full shadow-sm font-bold border-slate-200 dark:border-white/10 shrink-0 gap-2 h-10 px-5 bg-white dark:bg-slate-900"
                    >
                      <Filter className="h-4 w-4 text-primary" /> Filtres
                    </Button>
                  }
                />
                <SheetContent
                  side="left"
                  className="w-[85vw] sm:w-87.5 p-6 pt-12"
                >
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-black tracking-tight text-left flex items-center gap-2">
                      <Filter className="h-5 w-5 text-primary" /> Filtres
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-[0.2em] text-slate-400">
                        CATÉGORIES
                      </h4>
                      <div className="flex flex-col gap-2">
                        <SheetClose
                          render={
                            <button
                              onClick={() => updateFilters({ category: null })}
                              className={cn(
                                "text-left px-4 py-3 rounded-xl text-sm font-bold transition-all w-full",
                                !categoryId
                                  ? "bg-primary text-white shadow-md"
                                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300",
                              )}
                            >
                              Tout l&apos;inventaire
                            </button>
                          }
                        />
                        {categories.map((cat: Category) => (
                          <SheetClose
                            key={cat.id}
                            render={
                              <button
                                onClick={() =>
                                  updateFilters({ category: cat.id })
                                }
                                className={cn(
                                  "text-left px-4 py-3 rounded-xl text-sm font-bold transition-all w-full",
                                  categoryId === cat.id
                                    ? "bg-primary text-white shadow-md"
                                    : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300",
                                )}
                              >
                                {cat.name}
                              </button>
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col gap-8 sticky top-32 bg-white/40 dark:bg-card/40 backdrop-blur-3xl p-6 xl:p-8 rounded-4xl xl:rounded-[3rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-primary/5">
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" /> Filtres
                </h3>
                <div className="w-full h-px bg-slate-200 dark:bg-white/10" />
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black tracking-[0.2em] text-slate-400">
                  CATÉGORIES
                </h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateFilters({ category: null })}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      !categoryId
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-300",
                    )}
                  >
                    Tout l&apos;inventaire
                  </button>
                  {categories.map((cat: Category) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilters({ category: cat.id })}
                      className={cn(
                        "text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
                        categoryId === cat.id
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-300",
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-4/5 rounded-[4rem] bg-slate-200 dark:bg-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <ProductGrid
                products={products}
                selectedBoutiqueId={boutiqueId}
              />
            ) : (
              <div className="py-12 md:py-40 text-center space-y-6 md:space-y-8 glass-card rounded-4xl animate-in zoom-in-95 duration-1000 mx-4 border-slate-200 dark:border-white/5">
                <div className="h-16 w-16 md:h-24 md:w-24 bg-primary/10 rounded-2xl md:rounded-4xl flex items-center justify-center mx-auto text-primary animate-bounce-slow">
                  <Hammer className="h-8 w-8 md:h-12 md:w-12" />
                </div>
                <div className="space-y-3 px-4">
                  <h3 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white italic">
                    Coffre vide.
                  </h3>
                  <p className="text-sm md:text-xl text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                    Aucun matériel ne correspond à ces critères.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/products")}
                  className="rounded-full px-8 md:px-12 h-12 md:h-16 bg-primary text-white font-black tracking-tight text-sm md:text-lg shadow-2xl hover:scale-105 transition-all w-full sm:w-auto mt-4 mx-auto"
                >
                  Voir tout le stock
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <PublicLayout>
      <Suspense
        fallback={
          <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </PublicLayout>
  );
}
