"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";

const PRESETS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "7-days", label: "7 derniers jours" },
  { id: "30-days", label: "30 derniers jours" },
  { id: "custom", label: "Personnalisé" },
];

const STATUS_FILTERS = [
  { id: "all", label: "Toutes les commandes" },
  { id: "pending", label: "En attente" },
  { id: "completed", label: "Livré" },
  { id: "cancelled", label: "Annulé" },
];

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activePreset = searchParams.get("preset") || "today";
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

  const openPicker = (e: React.MouseEvent<HTMLDivElement>) => {
    const input = e.currentTarget.querySelector("input") as HTMLInputElement;
    if (input) {
      if ("showPicker" in HTMLInputElement.prototype) {
        try {
          input.showPicker();
        } catch {
          input.click();
        }
      } else {
        input.click();
      }
    }
  };

  const handlePresetChange = (presetId: string) => {
    if (presetId === "custom") {
      updateParams({ preset: "custom" });
      return;
    }

    let start = null;
    let end = null;
    const now = new Date();

    if (presetId === "today") {
      start = format(startOfDay(now), "yyyy-MM-dd'T'HH:mm:ss");
      end = format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss");
    } else if (presetId === "7-days") {
      start = format(startOfDay(subDays(now, 7)), "yyyy-MM-dd'T'HH:mm:ss");
      end = format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss");
    } else if (presetId === "30-days") {
      start = format(startOfDay(subDays(now, 30)), "yyyy-MM-dd'T'HH:mm:ss");
      end = format(endOfDay(now), "yyyy-MM-dd'T'HH:mm:ss");
    }

    updateParams({
      preset: presetId,
      startDate: start,
      endDate: end,
    });
  };

  const handleDateChange = (type: "start" | "end", dateValue: string) => {
    if (!dateValue) return;
    const date =
      type === "start"
        ? startOfDay(new Date(dateValue))
        : endOfDay(new Date(dateValue));
    updateParams({
      [type === "start" ? "startDate" : "endDate"]: format(
        date,
        "yyyy-MM-dd'T'HH:mm:ss",
      ),
      preset: "custom",
    });
  };

  const clearFilters = () => {
    router.push("/dashboard/orders");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
      {/* Première ligne : Titre + Périodes + Dates personnalisées */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
          Filtrer les commandes
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          {/* Groupement des Presets */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={cn(
                  "px-4 py-2 text-[13px] font-medium transition-colors border-r last:border-r-0 border-slate-200 dark:border-slate-700",
                  activePreset === preset.id
                    ? "bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "bg-white text-slate-500 hover:text-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Dates personnalisées */}
          <div className="flex items-center gap-2">
            <div
              onClick={openPicker}
              className="relative flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:border-slate-300 transition-colors cursor-pointer min-w-35 select-none"
            >
              <CalendarIcon className="h-4 w-4 text-slate-400 pointer-events-none" />
              <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 pointer-events-none line-clamp-1">
                {startDate
                  ? format(new Date(startDate), "dd MMM yyyy", { locale: fr })
                  : "Date début"}
              </span>
              <input
                type="date"
                defaultValue={
                  startDate ? format(new Date(startDate), "yyyy-MM-dd") : ""
                }
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
              />
            </div>
            <span className="text-slate-400 text-sm">à</span>
            <div
              onClick={openPicker}
              className="relative flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:border-slate-300 transition-colors cursor-pointer min-w-35 select-none"
            >
              <CalendarIcon className="h-4 w-4 text-slate-400 pointer-events-none" />
              <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 pointer-events-none line-clamp-1">
                {endDate
                  ? format(new Date(endDate), "dd MMM yyyy", { locale: fr })
                  : "Date fin"}
              </span>
              <input
                type="date"
                defaultValue={
                  endDate ? format(new Date(endDate), "yyyy-MM-dd") : ""
                }
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deuxième ligne : Filtres de statut */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status.id}
              onClick={() => updateParams({ status: status.id })}
              className={cn(
                "px-5 py-2 rounded-lg text-[13px] font-medium transition-all border",
                activeStatus === status.id
                  ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400",
              )}
            >
              {status.label}
            </button>
          ))}
        </div>

        {(startDate ||
          endDate ||
          activeStatus !== "all" ||
          activePreset !== "today") && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 text-[13px] font-medium transition-colors"
          >
            <X className="h-4 w-4" />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
