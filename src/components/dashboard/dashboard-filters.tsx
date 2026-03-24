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
  
  const currentRange = searchParams.get("range") || "today";
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
    </div>
  );
}
