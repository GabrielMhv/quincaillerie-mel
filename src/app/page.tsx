import { createClient } from "@/lib/supabase/server";
import PublicLayout from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Star, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Zap,
  Package,
  Headphones,
  Wrench,
  Construction,
  Hammer
} from "lucide-react";
import Image from "next/image";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";

export default async function HomePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const boutiqueId = searchParams.boutiqueId as string | undefined;
  const supabase = await createClient();

  // Fetch Categories for navigation
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch Products (either global or boutique specific)
  let productsQuery = supabase.from("products").select("*, category:categories(name), stocks(id, boutique_id, quantity)").limit(8);
  if (boutiqueId) {
     // Filtering logic handled by query for consistency
  }
  const { data: products } = await productsQuery.order("created_at", { ascending: false });

  return (
    <PublicLayout>
      <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Cinematic Backdrop Layers */}
        <div className="absolute top-0 left-[-10%] w-[1200px] h-[1200px] bg-primary/5 rounded-full blur-[160px] -z-10 animate-pulse pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[160px] -z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.08] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 pt-16 lg:pt-32 pb-40">
          
          {/* High-Impact Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-24 mb-48">
            <div className="lg:w-3/5 space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest leading-none">
                <Sparkles className="h-4 w-4" /> Qualité d&apos;exception & expertise technique
              </div>
              
              <div className="space-y-6">
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900 dark:text-white">
                  Tout pour <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-[length:200%_auto] animate-gradient">vos chantiers.</span>
                </h1>
                <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                  L&apos;outillage professionnel et les matériaux de construction qu&apos;il vous faut à Ségbé et Sanguera. Plus de 2500 références en stock pour les pros et les particuliers.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 pt-6">
                <Link href={boutiqueId ? `/products?boutiqueId=${boutiqueId}` : "/products"}>
                  <Button className="rounded-full px-12 h-20 bg-primary text-white font-black tracking-tight text-lg shadow-3xl hover:scale-105 active:scale-95 transition-all group overflow-hidden">
                    Commander mes matériels
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-3" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="rounded-full px-12 h-20 border-2 border-slate-200 dark:border-white/10 font-bold tracking-tight text-lg hover:bg-white dark:hover:bg-white/5 hover:border-primary/50 transition-all">
                    Demander un devis
                  </Button>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-10 pt-10 border-t border-slate-200 dark:border-white/5 max-w-xl">
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">15k+</p>
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest">Clients servis</p>
                </div>
                <div className="h-12 w-px bg-slate-200 dark:bg-white/5" />
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">2.5k</p>
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest">Références</p>
                </div>
                <div className="h-12 w-px bg-slate-200 dark:bg-white/5" />
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">05</p>
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest">Points de vente</p>
                </div>
              </div>
            </div>

            {/* Immersive Visual Group */}
            <div className="lg:w-2/5 relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
               <div className="relative z-10 rounded-[4rem] overflow-hidden p-3 bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/50 dark:border-white/10 shadow-3xl">
                  <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden border border-white/20 dark:border-white/10 shadow-inner group">
                    <Image 
                      src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop" 
                      alt="Expertise technique" 
                      fill 
                      priority
                      unoptimized
                      className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute bottom-12 left-12 right-12 space-y-4">
                      <div className="h-1 w-12 bg-primary rounded-full" />
                      <h3 className="text-4xl font-black tracking-tighter text-white leading-tight">
                        La passion de la <br />Précision.
                      </h3>
                    </div>
                  </div>
               </div>
               
               {/* Floating elements with depth */}
               <div className="absolute -bottom-12 -left-12 glass p-8 rounded-[3rem] shadow-3xl flex items-center gap-6 animate-bounce-slow border-white/40 dark:border-white/10">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-black tracking-tighter text-slate-900 dark:text-white leading-none">Stock Disponible</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">Lomė, Ségbé, Sanguera</p>
                  </div>
               </div>
               
               <div className="absolute -top-8 -right-8 h-24 w-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl animate-pulse shadow-indigo-600/30">
                  <Wrench className="h-10 w-10" />
               </div>
            </div>
          </div>

          {/* Core Specializations (Categories Cards) */}
          <section className="mb-48 space-y-16">
             <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <p className="text-[11px] font-black tracking-[0.3em] text-primary uppercase">Expertise Sectorielle</p>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">Nos domaines de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">spécialisation.</span></h2>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories?.slice(0, 6).map((category, i) => (
                  <Link 
                    key={category.id} 
                    href={`/products?category=${category.id}`} 
                    className="group relative h-48 flex flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:border-primary/50 hover:bg-primary transition-all duration-500 text-center shadow-sm hover:shadow-2xl hover:shadow-primary/30"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 group-hover:bg-white/20 flex items-center justify-center text-primary group-hover:text-white transition-all">
                       <Layers className="h-6 w-6" />
                    </div>
                    <span className="text-[12px] font-bold tracking-tight text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors">{category.name}</span>
                  </Link>
                ))}
             </div>
          </section>

          {/* Professional Advantages Grid */}
          <section className="mb-48">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { 
                  icon: Truck, 
                  title: "Logistique unifiée", 
                  desc: "Un stock synchronisé en temps réel sur l'ensemble de notre réseau pour une disponibilité immédiate.", 
                  color: "blue" 
                },
                { 
                  icon: ShieldCheck, 
                  title: "Qualité certifiée", 
                  desc: "Chaque outil et matériau est rigoureusement testé pour répondre aux standards internationaux de sécurité.", 
                  color: "emerald" 
                },
                { 
                  icon: Headphones, 
                  title: "Conseil expert", 
                  desc: "Nos techniciens vous accompagnent dans le choix technique de vos équipements pour optimiser vos chantiers.", 
                  color: "indigo" 
                }
              ].map((advantage, i) => (
                <div key={i} className="group relative p-10 rounded-[3.5rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-xl">
                  <div className={cn(
                    "h-16 w-16 rounded-2xl mb-8 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-black/5",
                    advantage.color === "blue" ? "bg-blue-500 text-white" : 
                    advantage.color === "emerald" ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
                  )}>
                    <advantage.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">{advantage.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-[15px] leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {advantage.desc}
                  </p>
                  <div className="mt-8 scale-x-0 group-hover:scale-x-100 h-1 w-12 bg-primary transition-transform origin-left duration-500" />
                </div>
              ))}
            </div>
          </section>

          {/* Featured Collections Overlay */}
          <section className="mb-48 space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
              <div className="space-y-4">
                <p className="text-[11px] font-black tracking-[0.3em] text-primary uppercase">Collections Vedettes</p>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">Le meilleur de <br />notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-indigo-400">inventaire.</span></h2>
              </div>
              <Link href="/products" className="group h-16 px-10 rounded-full border-2 border-slate-200 dark:border-white/10 flex items-center gap-3 text-sm font-black tracking-tight hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all">
                Voir tout le catalogue <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {products?.map((product, i) => (
                <ProductCard 
                  key={product.id} 
                  product={product as unknown as Product} 
                  delay={i * 100} 
                  selectedBoutiqueId={boutiqueId} 
                />
              ))}
            </div>
          </section>

          {/* Master CTA Container */}
          <section className="relative">
             <div className="absolute inset-0 bg-primary rounded-[5rem] rotate-1 scale-[1.02] -z-10 opacity-10 blur-xl" />
             <div className="relative z-10 p-1 lg:p-2 rounded-[5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-3xl overflow-hidden group">
                {/* Background animations within CTA */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none group-hover:scale-125 transition-transform duration-[3s]" />
                
                <div className="relative z-10 p-12 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-20">
                   <div className="space-y-10 lg:w-3/5 text-center lg:text-left">
                      <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 text-white/90 text-[10px] font-black tracking-widest backdrop-blur-md border border-white/10">
                        <Landmark className="h-4 w-4 text-blue-400" /> Partenaire des grands projets
                      </div>
                      <h2 className="text-6xl lg:text-8xl font-black tracking-tighter text-white leading-tight">
                        Prêt pour vos <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">futurs chantiers ?</span>
                      </h2>
                      <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                        Bénéficiez de conditions préférentielles et d&apos;un support technique dédié pour vos approvisionnements professionnels.
                      </p>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-6">
                        <Button className="rounded-full px-12 h-20 bg-white text-slate-900 font-black tracking-tight text-xl shadow-2xl hover:scale-105 transition-all">
                          Devenir partenaire
                        </Button>
                        <Button variant="outline" className="rounded-full px-12 h-20 border-white/20 text-white hover:bg-white/10 font-bold tracking-tight text-xl backdrop-blur-sm">
                           Nous contacter
                        </Button>
                      </div>
                   </div>

                   <div className="lg:w-1/3 grid grid-cols-2 gap-6 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300">
                      {[
                        { icon: Package, label: "2500+", sub: "Stock Global" },
                        { icon: Hammer, label: "Pro", sub: "Gamme Outillage" },
                        { icon: Headphones, label: "Expert", sub: "Support 24/7" },
                        { icon: ShieldCheck, label: "Certifié", sub: "Normes CE/ISO" }
                      ].map((stat, i) => (
                        <div key={i} className="glass p-8 rounded-[3rem] items-center text-center space-y-3 border-white/10 hover:bg-white/10 transition-colors">
                           <stat.icon className="h-10 w-10 text-blue-400 mb-2 mx-auto" />
                           <p className="text-3xl font-black tracking-tighter text-white">{stat.label}</p>
                           <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{stat.sub}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

function Landmark(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7 12 2" />
    </svg>
  )
}
