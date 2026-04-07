"use client";

import PublicLayout from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import {
  Star,
  Users,
  Warehouse,
  Zap,
  Target,
  History,
  Hammer,
  Droplets,
  Lightbulb,
  Paintbrush,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  const stats = [
    { label: "Années à vos côtés", value: "5+" },
    { label: "Boutiques de proximité", value: "2" },
    { label: "Articles en stock", value: "1k+" },
    { label: "Clients satisfaits", value: "10k+" },
  ];

  const values = [
    {
      title: "Outillage certifié",
      description:
        "Nous sélectionnons rigoureusement chaque outil pour sa robustesse et sa fiabilité sur vos chantiers.",
      icon: Hammer,
      color: "bg-blue-600",
      delay: "delay-100",
    },
    {
      title: "Stock permanent",
      description:
        "Plus besoin d'attendre. Nos rayons à Ségbé et Sanguera sont fournis quotidiennement pour vous servir.",
      icon: Warehouse,
      color: "bg-amber-600",
      delay: "delay-200",
    },
    {
      title: "Conseil de pro",
      description:
        "Nos spécialistes vous guident dans le choix de vos matériaux, du gros œuvre aux finitions.",
      icon: Users,
      color: "bg-primary",
      delay: "delay-300",
    },
    {
      title: "Prix juste",
      description:
        "Ancrés localement, nous nous engageons à offrir le meilleur rapport qualité-prix de la région.",
      icon: Target,
      color: "bg-emerald-600",
      delay: "delay-400",
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
        <div className="hidden lg:block absolute top-0 right-[-10%] w-200 h-200 bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse pointer-events-none" />
        <div className="hidden lg:block absolute bottom-[-10%] left-[-10%] w-150 h-150 bg-blue-500/10 rounded-full blur-[150px] -z-10 pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 lg:pt-32 space-y-24 md:space-y-40 relative z-10">
          {/* Main Hero / Heritage Section */}
          <section className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            <div className="lg:col-span-7 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl text-primary text-[9px] md:text-[11px] font-black tracking-widest leading-none shadow-sm mx-auto lg:mx-0">
                <History className="h-4 w-4" /> 5 ans au service des bâtisseurs
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] md:leading-[0.85] text-slate-900 dark:text-white mx-auto lg:mx-0">
                La quincaillerie <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-500 to-primary bg-size[200%_auto] animate-gradient">
                  La Championne.
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Votre partenaire de confiance pour tout l&apos;outillage
                professionnel et les matériaux de construction de qualité à
                Ségbé et Sanguera.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-6 pt-4 w-full">
                <Link href="/products" className="shrink-0 w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 rounded-4xl px-8 md:px-12 h-14 md:h-18 font-black tracking-tighter text-base md:text-xl shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1"
                  >
                    Voir le catalogue
                  </Button>
                </Link>
                <Link href="/contact" className="shrink-0 w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-4xl px-8 md:px-12 h-14 md:h-18 border-2 border-slate-200 dark:border-white/10 font-bold tracking-tight text-base md:text-lg hover:bg-white dark:hover:bg-white/5 hover:-translate-y-1 transition-all backdrop-blur-md"
                  >
                    Demander conseil
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="relative group p-1 md:p-2 rounded-[2.5rem] md:rounded-[5rem] bg-linear-to-br from-white/30 to-transparent dark:from-white/10 border border-white/20 dark:border-white/5 shadow-3xl overflow-hidden aspect-4/5 lg:aspect-square">
                <Image
                  src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=1000&auto=format&fit=crop"
                  alt="Rayon bien rangé d'outils professionnels"
                  fill
                  unoptimized
                  priority
                  className="object-cover rounded-4xl md:rounded-[4.5rem] grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80" />
                <div className="absolute bottom-8 md:bottom-16 left-8 md:left-16 right-8 md:right-16 text-white space-y-3 md:space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="h-px w-12 bg-primary mb-4 md:mb-6" />
                  <p className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-emerald-400">
                    Expertise & Robustesse
                  </p>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight italic">
                    Rien que le meilleur pour vos travaux.
                  </h3>
                </div>
              </div>

              {/* Floating Medallion */}
              <div className="hidden lg:flex absolute -bottom-10 -right-10 glass p-10 rounded-[4rem] shadow-4xl border-white/40 dark:border-white/10 animate-in slide-in-from-bottom-8 duration-700 delay-700 hover:-rotate-6 transition-transform text-center flex-col items-center z-20">
                <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
                  <Star className="h-6 w-6 md:h-8 md:w-8 text-amber-400 fill-amber-400" />
                  <span className="text-4xl md:text-5xl font-black tracking-tighter text-slate-800 dark:text-white">
                    5
                  </span>
                </div>
                <p className="text-[10px] font-black tracking-widest text-muted-foreground opacity-60">
                  Ans d&apos;excellence
                </p>
              </div>
            </div>
          </section>

          {/* Large Stats Grid */}
          <section className="relative p-1 md:p-2 rounded-4xl md:rounded-[5rem] bg-white/20 dark:bg-white/5 backdrop-blur-3xl border border-white/40 dark:border-white/10 shadow-3xl animate-in fade-in duration-1000 mt-12 md:mt-20">
            <div className="grid grid-cols-2 gap-6 md:gap-12 lg:grid-cols-4 p-4 md:p-12 lg:p-20">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center group border-r border-slate-200 dark:border-white/10 last:border-none px-2 sm:px-6 even:border-none lg:even:border-r"
                >
                  <div className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 md:mb-4 tabular-nums group-hover:text-primary group-hover:scale-110 transition-all duration-500 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[9px] md:text-[11px] font-black text-muted-foreground tracking-widest opacity-60">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pillars of Excellence */}
          <section className="space-y-16 md:space-y-24 mt-20">
            <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto px-4 lg:px-0">
              <div className="inline-block p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2 md:mb-4 animate-pulse">
                <Hammer className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
                La qualité au meilleur prix
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Depuis nos débuts à Lomé, nous nous engageons à fournir du
                matériel pro accessible à tous les bâtisseurs de demain.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, i) => (
                <div
                  key={i}
                  className={cn(
                    "group relative p-6 md:p-10 rounded-4xl md:rounded-[3.5rem] bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-700 hover:shadow-3xl hover:shadow-primary/5 hover:-translate-y-3 overflow-hidden",
                    "animate-in fade-in slide-in-from-bottom-12 duration-700",
                    value.delay,
                  )}
                >
                  <div
                    className={cn(
                      "inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-2xl md:rounded-3xl mb-6 md:mb-10 text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
                      value.color,
                    )}
                  >
                    <value.icon className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tighter mb-4 md:mb-5 group-hover:text-primary transition-colors leading-none">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-sm md:text-base leading-relaxed mb-6 md:mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    {value.description}
                  </p>
                  <div className="absolute -bottom-12 -right-12 h-32 w-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                </div>
              ))}
            </div>
          </section>

          {/* Vision Section - More store focused */}
          <section className="relative rounded-4xl md:rounded-[6rem] p-1 md:p-2 bg-linear-to-br from-indigo-950 to-slate-950 shadow-4xl group overflow-hidden mt-16 md:mt-24 mb-16 md:mb-20">
            <div className="absolute inset-0 bg-premium-grid opacity-20 pointer-events-none" />
            <div className="relative z-10 p-6 md:p-12 lg:p-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/10 text-emerald-400 text-[9px] md:text-[10px] font-black tracking-[0.2em] backdrop-blur-xl border border-white/10 mx-auto lg:mx-0">
                  <Zap className="h-3.5 w-3.5 md:h-4 md:w-4" /> Toujours plus
                  loin
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter text-white leading-none md:leading-[0.9] mx-auto lg:mx-0">
                  Une offre <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-green-500">
                    sans compromis.
                  </span>
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl text-white/50 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Que vous soyez un professionnel du bâtiment ou un bricoleur
                  passionné, La Championne a tout ce qu&apos;il vous faut.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                  {categories.map((cat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center lg:justify-start gap-5 group/item"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover/item:bg-blue-400 group-hover/item:text-white group-hover/item:scale-110 transition-all duration-500 shrink-0">
                        <cat.icon className="h-6 w-6" />
                      </div>
                      <span className="text-white/80 text-xl font-bold tracking-tight group-hover/item:text-white transition-colors">
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/products"
                  className="inline-block w-full sm:w-auto mt-6 md:mt-0"
                >
                  <Button className="w-full sm:w-auto rounded-4xl px-8 md:px-10 h-14 md:h-16 bg-primary hover:bg-primary/80 text-white font-black tracking-tighter text-base md:text-lg shadow-xl transition-all active:scale-95">
                    Découvrir tout le matériel
                  </Button>
                </Link>
              </div>

              <div className="relative min-h-75 lg:min-h-125 w-full lg:w-1/2 overflow-hidden rounded-3xl md:rounded-[4rem] border border-white/10 shadow-3xl bg-slate-900 group/image">
                <Image
                  src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800&auto=format&fit=crop"
                  alt="Vis, boulons et pièces de quincaillerie"
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
