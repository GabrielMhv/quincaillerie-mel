"use client";

import PublicLayout from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Star, Users, Warehouse, Sparkles, Zap, Target, History, Globe, Shield, Hammer, Droplets, Lightbulb, Paintbrush } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  const stats = [
    { label: "Années à vos côtés", value: "15+" },
    { label: "Boutiques de proximité", value: "5" },
    { label: "Articles en stock", value: "5k+" },
    { label: "Clients satisfaits", value: "10k+" },
  ];

  const values = [
    {
      title: "Outillage certifié",
      description: "Nous sélectionnons rigoureusement chaque outil pour sa robustesse et sa fiabilité sur vos chantiers.",
      icon: Hammer,
      color: "bg-blue-600",
      delay: "delay-100"
    },
    {
      title: "Stock permanent",
      description: "Plus besoin d'attendre. Nos rayons à Ségbé et Sanguera sont fournis quotidiennement pour vous servir.",
      icon: Warehouse,
      color: "bg-amber-600",
      delay: "delay-200"
    },
    {
      title: "Conseil de pro",
      description: "Nos spécialistes vous guident dans le choix de vos matériaux, du gros œuvre aux finitions.",
      icon: Users,
      color: "bg-primary",
      delay: "delay-300"
    },
    {
      title: "Prix juste",
      description: "Ancrés localement, nous nous engageons à offrir le meilleur rapport qualité-prix de la région.",
      icon: Target,
      color: "bg-emerald-600",
      delay: "delay-400"
    },
  ];

  const categories = [
    { name: "Plomberie", icon: Droplets },
    { name: "Électricité", icon: Lightbulb },
    { name: "Peinture", icon: Paintbrush },
    { name: "Maçonnerie", icon: Hammer },
  ];

  return (
    <PublicLayout>
      <div className="relative min-h-screen pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Advanced Background Elements */}
        <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] -z-10 pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />

        <div className="container mx-auto px-6 pt-20 lg:pt-32 space-y-40 relative z-10">
          
          {/* Main Hero / Heritage Section */}
          <section className="grid gap-20 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl text-primary text-[11px] font-black tracking-widest leading-none shadow-sm">
                <History className="h-4 w-4" /> 15 ans au service des bâtisseurs
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-slate-900 dark:text-white">
                La quincaillerie <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_auto] animate-gradient">La Championne.</span>
              </h1>
              <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                Votre partenaire de confiance pour tout l&apos;outillage professionnel et les matériaux de construction de qualité à Ségbé et Sanguera.
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                  <Link href="/products" className="shrink-0 w-full md:w-auto">
                     <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-[1.5rem] px-12 h-18 font-black tracking-tighter text-xl shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1">
                        Voir le catalogue
                     </Button>
                  </Link>
                <Link href="/contact" className="shrink-0 w-full md:w-auto">
                  <Button size="lg" variant="outline" className="rounded-[1.5rem] px-12 h-18 border-2 border-slate-200 dark:border-white/10 font-bold tracking-tight text-lg hover:bg-white dark:hover:bg-white/5 hover:-translate-y-1 transition-all backdrop-blur-md">
                    Demander conseil
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
               <div className="relative group p-2 rounded-[5rem] bg-gradient-to-br from-white/30 to-transparent dark:from-white/10 border border-white/20 dark:border-white/5 shadow-3xl overflow-hidden aspect-[4/5] lg:aspect-square">
                  <Image 
                    src="https://images.unsplash.com/photo-1530124560676-4fbc912f22c5?auto=format&fit=crop&q=80&w=1000"
                    alt="Matériel de quincaillerie"
                    fill
                    unoptimized
                    priority
                    className="object-cover rounded-[4.5rem] grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80" />
                  <div className="absolute bottom-16 left-16 right-16 text-white space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                     <div className="h-px w-12 bg-primary mb-6" />
                     <p className="text-[10px] font-black tracking-[0.4em] text-blue-400">Expertise & Robustesse</p>
                     <h3 className="text-4xl font-black tracking-tighter leading-tight italic">Rien que le meilleur pour vos travaux.</h3>
                  </div>
               </div>
               
               {/* Floating Medallion */}
               <div className="absolute -bottom-10 -right-10 glass p-10 rounded-[4rem] shadow-4xl border-white/40 dark:border-white/10 animate-in slide-in-from-bottom-8 duration-700 delay-700 hover:-rotate-6 transition-transform text-center flex flex-col items-center">
                  <div className="flex items-center gap-4 mb-2">
                     <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
                     <span className="text-5xl font-black tracking-tighter text-slate-800 dark:text-white">15</span>
                  </div>
                  <p className="text-[10px] font-black tracking-widest text-muted-foreground opacity-60">Ans d&apos;excellence</p>
               </div>
            </div>
          </section>

          {/* Large Stats Grid */}
          <section className="relative p-2 rounded-[5rem] bg-white/20 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-3xl animate-in fade-in duration-1000">
            <div className="grid grid-cols-2 gap-12 md:grid-cols-4 p-12 md:p-20">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group border-r border-slate-200 dark:border-white/10 last:border-none px-6">
                  <div className="text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 tabular-nums group-hover:text-primary group-hover:scale-110 transition-all duration-500 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-black text-muted-foreground tracking-widest opacity-60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pillars of Excellence */}
          <section className="space-y-24">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
               <div className="inline-block p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-4 animate-pulse">
                  <Hammer className="h-6 w-6" />
               </div>
               <h2 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">La qualité au meilleur prix</h2>
               <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Depuis nos débuts à Lomé, nous nous engageons à fournir du matériel pro accessible à tous les bâtisseurs de demain.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, i) => (
                <div key={i} className={cn(
                   "group relative p-10 rounded-[3.5rem] bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-700 hover:shadow-3xl hover:shadow-primary/5 hover:-translate-y-3 overflow-hidden",
                   "animate-in fade-in slide-in-from-bottom-12 duration-700",
                   value.delay
                )}>
                  <div className={cn("inline-flex h-16 w-16 items-center justify-center rounded-3xl mb-10 text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", value.color)}>
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter mb-5 group-hover:text-primary transition-colors leading-none">{value.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-base leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    {value.description}
                  </p>
                  <div className="absolute -bottom-12 -right-12 h-32 w-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                </div>
              ))}
            </div>
          </section>

          {/* Vision Section - More store focused */}
          <section className="relative rounded-[6rem] p-2 bg-gradient-to-br from-indigo-950 to-slate-950 shadow-4xl group overflow-hidden">
             <div className="absolute inset-0 bg-premium-grid opacity-20 pointer-events-none" />
             <div className="relative z-10 p-12 lg:p-24 flex flex-col lg:flex-row items-center gap-24">
                <div className="flex-1 space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000">
                   <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/10 text-blue-400 text-[10px] font-black tracking-[0.2em] backdrop-blur-xl border border-white/10">
                      <Zap className="h-4 w-4" /> Toujours plus loin
                   </div>
                   <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                   Une offre <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">sans compromis.</span>
                </h2>
                <p className="text-2xl text-white/50 font-medium leading-relaxed max-w-xl">
                   Que vous soyez un professionnel du bâtiment ou un bricoleur passionné, La Championne a tout ce qu&apos;il vous faut.
                </p>       
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     {categories.map((cat, i) => (
                       <div key={i} className="flex items-center gap-5 group/item">
                          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover/item:bg-blue-400 group-hover/item:text-white group-hover/item:scale-110 transition-all duration-500">
                             <cat.icon className="h-6 w-6" />
                          </div>
                          <span className="text-white/80 text-xl font-bold tracking-tight group-hover/item:text-white transition-colors">{cat.name}</span>
                       </div>
                     ))}
                   </div>
                   <Link href="/products" className="inline-block">
                     <Button className="rounded-full px-10 h-16 bg-blue-500 hover:bg-blue-400 text-white font-black tracking-tighter text-lg shadow-xl transition-all active:scale-95">
                        Découvrir tout le matériel
                     </Button>
                   </Link>
                </div>

                <div className="relative h-[600px] w-full lg:w-1/2 overflow-hidden rounded-[5rem] border border-white/10 shadow-3xl bg-slate-900 group/image">
                   <Image 
                      src="https://images.unsplash.com/photo-1513467655676-561b7d489a88?auto=format&fit=crop&q=80&w=800"
                      alt="Outils de qualité"
                      fill
                      unoptimized
                      className="object-cover opacity-40 grayscale group-hover/image:grayscale-0 group-hover/image:scale-105 transition-all duration-1000"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="bg-primary/30 p-40 rounded-full blur-[120px] animate-pulse" />
                       <Hammer className="h-48 w-48 text-primary/40 relative z-10 group-hover/image:text-primary transition-all duration-1000 scale-90 group-hover/image:scale-110" />
                    </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
