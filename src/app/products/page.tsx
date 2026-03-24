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
                    if (e.key === 'Enter') updateFilters({ q: (e.target as HTMLInputElement).value });
                  }}
                />
             </div>
          </div>
        </div>

        {/* Horizontal Category Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-none justify-start md:justify-center mb-6 px-4">
            <button 
              onClick={() => updateFilters({ category: null })}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all",
                !categoryId ? "bg-primary text-white shadow-md" : "bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/5"
              )}
            >
               Menu Principal
            </button>
            {categories.map((cat: Category) => (
              <button 
                key={cat.id}
                onClick={() => updateFilters({ category: cat.id })}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all",
                  categoryId === cat.id ? "bg-primary text-white shadow-md" : "bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/5"
                )}
              >
                 {cat.name}
              </button>
            ))}
        </div>

        <div className="flex flex-col relative">

           {/* Main Content Area */}
           <main className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="flex items-center justify-between mb-8 px-4 hidden">
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
