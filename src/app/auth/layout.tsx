"use client";

import { useBranding } from "@/components/providers/branding-provider";
import { Warehouse, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useBranding();

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Decorative background for the whole page */}
      <div className="absolute top-0 right-[-10%] w-200 h-200 bg-primary/5 rounded-full blur-[160px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-150 h-150 bg-blue-500/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Left decorative side (Desktop only) */}
      <div className="hidden w-[45%] lg:flex relative overflow-hidden animate-in fade-in duration-1000">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1691429573116-d0b8dd7e7f73?q=80&w=2069&auto=format&fit=crop"
            alt="Magasin de quincaillerie"
            fill
            unoptimized
            className="object-cover grayscale brightness-[0.2]"
          />
          <div className="absolute inset-0 bg-linear-to-br from-indigo-950/90 via-slate-950/80 to-transparent z-10" />
        </div>

        <div className="absolute inset-0 bg-premium-grid opacity-20 z-20 pointer-events-none" />

        <div className="relative z-30 flex h-full flex-col p-16 text-white w-full">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
              <Warehouse className="h-8 w-8 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-white leading-none">
                {settings.name}
              </span>
              <span className="text-[10px] tracking-widest opacity-50 font-bold text-primary mt-1">
                Portail logistique
              </span>
            </div>
          </div>

          <div className="mt-auto space-y-10 max-w-lg mb-10">
            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tighter leading-tight">
                Pilotage <br />
                <span className="font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-400">
                  Multi-Boutique.
                </span>
              </h1>
              <p className="text-lg font-medium opacity-60 leading-relaxed max-w-md">
                Accédez à votre infrastructure de gestion centralisée pour
                piloter vos stocks et vos ventes en temps réel.
              </p>
            </div>

            <div className="p-10 rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-3xl space-y-4">
              <div className="flex items-center gap-4 text-primary">
                <ShieldAlert className="h-6 w-6" />
                <span className="text-sm font-black tracking-widest">
                  Accès Sécurisé
                </span>
              </div>
              <p className="text-[13px] font-medium opacity-50 leading-relaxed">
                Cet espace est réservé au personnel autorisé de l&apos;enseigne{" "}
                {settings.name}. Toute tentative de connexion non autorisée est
                enregistrée.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-10 border-t border-white/10 flex items-center justify-between text-[10px] font-black tracking-widest text-white/30">
            <span>Propulsé par Nexus v3.0</span>
            <span>&copy; 2026 {settings.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative">
        <div className="w-full max-w-lg z-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {children}
        </div>

        {/* Support floating info for mobile */}
        <div className="lg:hidden absolute bottom-12 left-12 right-12 text-center space-y-4">
          <p className="text-[10px] font-black tracking-widest text-slate-400">
            {settings.name} Admin Center
          </p>
        </div>
      </div>
    </div>
  );
}
