"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";

const PRESETS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "7-days", label: "7 derniers jours" },
  { id: "30-days", label: "30 derniers jours" },
];

const STATUS_FILTERS = [
  { id: "all", label: "Toutes les commandes" },
  { id: "pending", label: "En attente" },
  { id: "completed", label: "Validé" },
  { id: "cancelled", label: "Annulé" },
];

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const activePreset = searchParams.get("preset") || "30-days";
  const activeStatus = searchParams.get("status") || "all";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const handlePresetChange = (presetId: string) => {
    let start = null;
    let end = null;
    const now = new Date();

    if (presetId === "today") {
      start = format(startOfDay(now), "yyyy-MM-dd HH:mm:ss");
      end = format(endOfDay(now), "yyyy-MM-dd HH:mm:ss");
    } else if (presetId === "7-days") {
      start = format(startOfDay(subDays(now, 7)), "yyyy-MM-dd HH:mm:ss");
      end = format(endOfDay(now), "yyyy-MM-dd HH:mm:ss");
    } else if (presetId === "30-days") {
      start = format(startOfDay(subDays(now, 30)), "yyyy-MM-dd HH:mm:ss");
      end = format(endOfDay(now), "yyyy-MM-dd HH:mm:ss");
    }

    updateParams({
      preset: presetId,
      startDate: start,
      endDate: end,
    });
  };

  const clearFilters = () => {
    router.push("?");
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-top duration-500">
      {/* Date Presets and Range Inputs */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="ghost"
              size="sm"
              onClick={() => handlePresetChange(preset.id)}
              className={cn(
                "rounded-xl px-4 py-2 transition-all duration-300 font-bold text-[11px] tracking-widest",
                activePreset === preset.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-primary/5",
              )}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/40">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border/50 rounded-xl shadow-sm">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-black text-muted-foreground/80">
              {startDate
                ? format(new Date(startDate), "dd MMM yyyy", { locale: fr })
                : "Début"}
            </span>
          </div>
          <span className="text-muted-foreground font-black text-[10px]">
            à
          </span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border/50 rounded-xl shadow-sm">
            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-black text-muted-foreground/80">
              {endDate
                ? format(new Date(endDate), "dd MMM yyyy", { locale: fr })
                : "Fin"}
            </span>
          </div>
        </div>

        {(startDate || activeStatus !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 gap-2 font-bold text-[11px]"
          >
            <X className="h-4 w-4" /> Réinitialiser
          </Button>
        )}
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Button
            key={status.id}
            variant="ghost"
            size="sm"
            onClick={() => updateParams({ status: status.id })}
            className={cn(
              "rounded-full px-5 py-2.5 transition-all duration-500 font-black text-[11px] tracking-tight border-2",
              activeStatus === status.id
                ? "bg-green-500 text-white border-green-500 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
                : "bg-background border-border/50 text-muted-foreground hover:border-green-500/40 hover:text-green-600",
            )}
          >
            {status.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
