"use client";

import { Suspense, useState, useEffect } from "react";
import PublicLayout from "@/components/layout/public-layout";
import { ProductGrid } from "@/components/products/product-grid";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Sparkles, Filter, ChevronRight, LayoutGrid, X, Hammer, Warehouse, Landmark, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
  const [localMin, setLocalMin] = useState(minPrice || "");
  const [localMax, setLocalMax] = useState(maxPrice || "");

  useEffect(() => {
    setLocalSearch(search);
    setLocalMin(minPrice || "");
    setLocalMax(maxPrice || "");
  }, [search, minPrice, maxPrice]);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
       setIsLoading(true);
       
       // Categories
       const { data: catData } = await supabase.from("categories").select("*").order("name");
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
      <div className="absolute top-0 right-[-5%] w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.08] pointer-events-none" />

      <div className="container mx-auto px-6 pt-24 lg:pt-36">
        
        {/* Immersive Showroom Hero */}
        <div className="relative mb-32 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black tracking-widest shadow-sm">
              <Warehouse className="h-3.5 w-3.5" /> Inventaire certifié A+
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-slate-900 dark:text-white">
              Showroom <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-[length:200%_auto] animate-gradient">Equipements.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
              Explorez notre sélection rigoureuse d&apos;outillage professionnel et de matériaux haut de gamme, sourcés pour la réussite de vos projets au Togo.
            </p>
          </div>

          {/* Quick Search Overlay */}
          <div className="max-w-3xl relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
             <div className="relative glass p-4 rounded-[2.5rem] border-white/40 dark:border-white/10 flex items-center shadow-3xl hover:border-primary/50 transition-all duration-500">
                <Search className="ml-6 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors duration-500" />
                <Input
                  type="search"
                  placeholder="Quels matériaux ou outils cherchez-vous ?"
                  className="border-none bg-transparent shadow-none focus-visible:ring-0 text-xl font-bold h-16 px-6 placeholder:opacity-30"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateFilters({ q: (e.target as HTMLInputElement).value });
                  }}
                />
                <Button
                  onClick={() => updateFilters({ q: localSearch || null })}
                  className="h-16 px-10 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black tracking-tighter text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
                >
                  Chercher
                </Button>
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 relative">
           
           {/* Dynamic Sidebar Filters */}
           <aside className="lg:w-80 space-y-16 animate-in fade-in slide-in-from-left-8 duration-700 delay-300">
              <div className="space-y-8">
                 <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                    <h4 className="text-[11px] font-black tracking-widest text-slate-400">Catégories</h4>
                 </div>
                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => updateFilters({ category: null })}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl text-[13px] font-bold tracking-tight transition-all text-left",
                        !categoryId ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
                      )}
                    >
                       <span>Toutes les catégories</span>
                       {!categoryId && <ChevronRight className="h-4 w-4" />}
                    </button>
                    {categories.map((cat: Category) => (
                      <button 
                        key={cat.id}
                        onClick={() => updateFilters({ category: cat.id })}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl text-[13px] font-bold tracking-tight transition-all text-left",
                          categoryId === cat.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
                        )}
                      >
                         <span className="truncate pr-4">{cat.name}</span>
                         {categoryId === cat.id && <ChevronRight className="h-4 w-4" />}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="h-px w-full bg-slate-200 dark:bg-white/5" />

              <div className="space-y-8">
                 <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                    <Landmark className="h-5 w-5 text-primary" />
                    <h4 className="text-[11px] font-black tracking-widest text-slate-400">Affinement technique</h4>
                 </div>
                 
                 {/* Price Inputs */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground tracking-widest px-2">Budget (FCFA)</p>
                    <div className="grid grid-cols-2 gap-3">
                       <Input 
                         placeholder="Min"
                         className="h-12 rounded-2xl bg-white/40 dark:bg-white/5 border-none font-bold text-xs px-5 focus-visible:ring-primary/40" 
                         value={localMin}
                         onChange={(e) => setLocalMin(e.target.value)}
                         onBlur={(e) => updateFilters({ min: e.target.value || null })}
                       />
                       <Input 
                         placeholder="Max"
                         className="h-12 rounded-2xl bg-white/40 dark:bg-white/5 border-none font-bold text-xs px-5 focus-visible:ring-primary/40" 
                         value={localMax}
                         onChange={(e) => setLocalMax(e.target.value)}
                         onBlur={(e) => updateFilters({ max: e.target.value || null })}
                       />
                    </div>
                 </div>

                 {/* Stock Toggle */}
                 <button 
                   onClick={() => updateFilters({ stock: inStock ? null : 'true' })}
                   className={cn(
                     "w-full flex items-center gap-4 p-5 rounded-3xl transition-all border-2",
                     inStock 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                      : "bg-white/40 dark:bg-white/5 border-transparent text-muted-foreground hover:bg-white dark:hover:bg-white/10"
                   )}
                 >
                     <div className={cn("h-6 w-6 rounded-xl border-2 border-current flex items-center justify-center transition-all p-1", inStock && "bg-emerald-500 border-emerald-500")}>
                        {inStock && <Sparkles className="h-full w-full text-white" />}
                     </div>
                     <span className="text-xs font-black tracking-tight">Vérifier stock immédiat</span>
                 </button>
              </div>

              <Button 
                 variant="ghost" 
                 onClick={() => router.push(`/products${boutiqueId ? `?boutiqueId=${boutiqueId}` : ""}`)}
                 className="w-full h-14 rounded-3xl font-black text-[11px] tracking-widest opacity-40 hover:opacity-100 hover:bg-slate-200 dark:hover:bg-white/5"
              >
                 Réinitialiser les filtres
              </Button>
           </aside>

           {/* Main Content Area */}
           <main className="flex-1 animate-in fade-in slide-in-from-right-8 duration-700 delay-500">
              <div className="flex items-center justify-between mb-12 px-4">
                 <div className="space-y-1">
                    <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                       {products.length} {products.length > 1 ? 'Articles disponibles' : 'Article disponible'}
                    </h3>
                    <p className="text-[11px] font-black tracking-widest text-primary">
                       Boutique : {boutiqueId === 'f5b4d792-5d9e-4e5c-a123-123456789abc' ? 'Ségbé' : 'Sanguera'}
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/40 dark:bg-white/5 flex items-center justify-center text-primary shadow-sm">
                       <LayoutGrid className="h-5 w-5" />
                    </div>
                 </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[4/5] rounded-[4rem] bg-slate-200 dark:bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <ProductGrid products={products} selectedBoutiqueId={boutiqueId} />
              ) : (
                <div className="py-40 text-center space-y-8 glass-card rounded-[5rem] animate-in zoom-in-95 duration-1000">
                  <div className="h-32 w-32 bg-primary/10 rounded-[3rem] flex items-center justify-center mx-auto text-primary animate-bounce-slow">
                    <Hammer className="h-14 w-14" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white italic">
                      Coffre vide.
                    </h3>
                    <p className="text-xl text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                      Aucun matériel ne semble correspondre à ces critères. Essayez d&apos;élargir votre recherche technique.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/products')}
                    className="rounded-full px-12 h-16 bg-primary text-white font-black tracking-tight text-lg shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
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
      <Suspense fallback={
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ProductsContent />
      </Suspense>
    </PublicLayout>
  );
}
