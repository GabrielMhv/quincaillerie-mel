"use client";

import { Search, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types";
import { useEffect, useState, useCallback } from "react";

interface ProductFiltersProps {
  categories: Category[];
  searchQuery?: string;
  categoryFilter?: string;
}

export function ProductFilters({
  categories,
  searchQuery = "",
  categoryFilter = "all",
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  const handleFilterChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValue =
        params.get(name) || (name === "category" ? "all" : "");

      if (currentValue === value) return; // Skip if no change

      if (value === "all" || !value) {
        params.delete(name);
      } else {
        params.set(name, value);
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Auto-apply search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilterChange("q", searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, handleFilterChange]);

  return (
    <div className="flex flex-col md:flex-row flex-1 items-center gap-6 w-full">
      {/* Search */}
      <div className="relative flex-1 w-full group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Rechercher par nom, référence ou marque..."
          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* Category Selector */}
      <div className="relative group w-full md:w-auto">
        <select
          value={categoryFilter}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="appearance-none w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-6 pr-12 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all cursor-pointer md:min-w-60 text-slate-700 dark:text-slate-300"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Filter className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
