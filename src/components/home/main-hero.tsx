"use client";

import { useBranding } from "@/components/providers/branding-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

interface MainHeroProps {
  boutiqueId?: string;
}

export function MainHero({ boutiqueId }: MainHeroProps) {
  const { settings } = useBranding();

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Cinematic Backdrop Layers */}
      <div className="absolute top-0 left-[-10%] w-300 h-300 bg-primary/5 rounded-full blur-[160px] -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-250 h-250 bg-indigo-500/5 rounded-full blur-[160px] -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-premium-grid opacity-[0.03] dark:opacity-[0.08] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10 pt-10 sm:pt-16 lg:pt-32 pb-16 sm:pb-24 lg:pb-40 overflow-hidden md:overflow-visible">
        {/* High-Impact Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 sm:gap-12 lg:gap-24 mb-20 sm:mb-32 lg:mb-48">
          <div className="w-full lg:w-3/5 space-y-6 sm:space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-left-12 duration-1000 text-center lg:text-left">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.9] sm:leading-[0.85] text-slate-900 dark:text-white mx-auto lg:mx-0">
                Tout pour <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-blue-500 to-indigo-500 bg-size-[200%_auto] animate-gradient">
                  vos chantiers.
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed mx-auto lg:mx-0 px-2 sm:px-0">
                {settings.description ||
                  "L'outillage professionnel et les matériaux de construction qu'il vous faut. Plus de 2500 références en stock pour les pros et les particuliers."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-6 pt-4 sm:pt-6 w-full max-w-md sm:max-w-none mx-auto lg:mx-0">
              <Link
                href={
                  boutiqueId
                    ? `/products?boutiqueId=${boutiqueId}`
                    : "/products"
                }
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto rounded-full px-6 sm:px-8 md:px-12 h-14 sm:h-16 md:h-20 bg-primary text-white font-black tracking-tight text-sm sm:text-base md:text-lg shadow-3xl hover:scale-105 active:scale-95 transition-all group overflow-hidden">
                  Commander mes matériels
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-3" />
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-6 sm:px-8 md:px-12 h-14 sm:h-16 md:h-20 border-2 border-slate-200 dark:border-white/10 font-bold tracking-tight text-sm sm:text-base md:text-lg hover:bg-white dark:hover:bg-white/5 hover:border-primary/50 transition-all"
                >
                  Demander un devis
                </Button>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-10 pt-6 sm:pt-8 mt-4 border-t border-slate-200 dark:border-white/5 max-w-xl justify-center lg:justify-start mx-auto lg:mx-0">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  15k+
                </p>
                <p className="text-[8px] sm:text-[10px] font-black tracking-widest text-primary opacity-60 ">
                  Composants
                </p>
              </div>
              <div className="w-px h-8 sm:h-10 bg-slate-200 dark:bg-white/5" />
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  48h
                </p>
                <p className="text-[8px] sm:text-[10px] font-black tracking-widest text-primary opacity-60 ">
                  Livraison
                </p>
              </div>
              <div className="w-px h-8 sm:h-10 bg-slate-200 dark:bg-white/5" />
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                  24/7
                </p>
                <p className="text-[8px] sm:text-[10px] font-black tracking-widest text-primary opacity-60 ">
                  Disponibilité
                </p>
              </div>
            </div>
          </div>

          {/* Visual Part of Hero */}
          <div className="lg:w-2/5 relative animate-in zoom-in duration-1000 hidden lg:block">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
            <div className="relative glass p-4 rounded-[4rem] border-white/40 dark:border-white/5 shadow-3xl">
              <div className="relative h-150 w-full rounded-[3.5rem] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80"
                  alt="Outillage Professionnel"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 p-8 glass rounded-3xl border-white/20">
                  <p className="text-white font-black tracking-tighter text-2xl mb-2">
                    {settings.name}
                  </p>
                  <p className="text-white/70 text-sm font-medium leading-relaxed">
                    L&apos;excellence technique à votre service pour tous vos
                    besoins en quincaillerie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-slate-200 dark:bg-white/5 my-32" />
      </div>
    </div>
  );
}
