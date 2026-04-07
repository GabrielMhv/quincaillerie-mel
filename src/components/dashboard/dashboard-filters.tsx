"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentRange = searchParams.get("range") || "today";

  const [isCustomMode, setIsCustomMode] = useState(currentRange === "custom");
  const [fromDate, setFromDate] = useState(searchParams.get("from") || "");
  const [toDate, setToDate] = useState(searchParams.get("to") || "");

  useEffect(() => {
    setIsCustomMode(currentRange === "custom");
  }, [currentRange]);

  const ranges = [
    { label: "Aujourd'hui", value: "today" },
    { label: "7 derniers jours", value: "7d" },
    { label: "30 derniers jours", value: "30d" },
    { label: "Personnalisé", value: "custom" },
  ];

  const updateRange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (range === "custom") {
      setIsCustomMode(true);
      return; // Do not apply URL yet, wait for user to select dates
    }
    
    setIsCustomMode(false);
    params.set("range", range);
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyCustomFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 animate-in slide-in-from-top-4 duration-700">
      <div className="flex p-1.5 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm flex-wrap gap-1">
        {ranges.map((r) => (
          <button
            key={r.value}
            onClick={() => updateRange(r.value)}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black tracking-tighter transition-all duration-300",
              (currentRange === r.value && !isCustomMode) || (r.value === "custom" && isCustomMode)
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "hover:bg-primary/5 text-muted-foreground hover:text-primary",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {isCustomMode && (
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-sm animate-in fade-in slide-in-from-left duration-300">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-transparent border-none text-xs font-bold text-foreground focus:ring-0 cursor-pointer"
          />
          <span className="text-muted-foreground font-black text-xs">à</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-transparent border-none text-xs font-bold text-foreground focus:ring-0 cursor-pointer"
          />
          <Button 
            size="sm" 
            onClick={applyCustomFilter}
            className="rounded-xl h-8 text-xs font-black"
          >
            Appliquer
          </Button>
        </div>
      )}
    </div>
  );
}
