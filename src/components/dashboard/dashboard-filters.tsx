"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

export function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const currentRange = searchParams.get("range") || "7d";
  const boutiqueId = searchParams.get("boutiqueId");

  const ranges = [
    { label: "Aujourd'hui", value: "today" },
    { label: "7 derniers jours", value: "7d" },
    { label: "30 derniers jours", value: "30d" },
  ];

  const updateRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-top-4 duration-700">
      <div className="flex p-1.5 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => updateRange(r.value)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black tracking-tighter transition-all duration-300",
              currentRange === r.value
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm group cursor-pointer hover:border-primary/20 transition-all">
        <Calendar className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
        <span className="text-xs font-bold tracking-tight text-muted-foreground group-hover:text-primary transition-colors italic">
          Plage personnalisée
        </span>
        <ChevronDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-all" />
      </div>

      <div className="ml-auto flex items-center gap-2 group cursor-help px-4 py-2 rounded-full border border-dashed border-primary/10 hover:border-primary/30 transition-all">
         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
         <span className="text-[10px] font-black tracking-widest text-muted-foreground/60 italic lowercase">Données en direct</span>
      </div>
    </div>
  );
}
