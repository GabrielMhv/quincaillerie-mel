import { Warehouse, ShieldAlert } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                Ets La Championne
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
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-400">
                  multi-boutiques.
                </span>
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed">
                Gérez vos stocks, vos équipes et vos performances en temps réel
                sur l&apos;ensemble du réseau Ségbé et Sanguera.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-10 border-t border-white/5 opacity-40">
            <div className="text-[10px] font-bold tracking-widest">
              &copy; 2026 Ecosystème digital
            </div>
          </div>
        </div>
      </div>

      {/* Right side with form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[55%] lg:px-24 relative overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:max-w-md animate-in fade-in slide-in-from-right-12 duration-1000">
          {/* Mobile Branding */}
          <div className="lg:hidden mb-12 flex justify-center">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Warehouse className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white leading-none">
                  Ets La Championne
                </span>
                <span className="text-[9px] tracking-widest opacity-50 font-bold text-primary">
                  Console admin
                </span>
              </div>
            </div>
          </div>

          <div className="relative group">
            {/* Background decorative glow for form */}
            <div className="absolute -inset-4 bg-primary/5 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />

            <div className="bg-white/70 dark:bg-white/3 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3.5rem] p-6 lg:p-14 shadow-3xl border border-white dark:border-white/10">
              <div className="relative z-10">{children}</div>
            </div>
          </div>

          <div className="mt-12 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200 dark:bg-white/5 text-[10px] font-bold tracking-tight text-slate-400">
              <ShieldAlert className="h-3 w-3" /> Espace réservé au personnel
              autorisé
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
