"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useBoutique } from "@/components/providers/boutique-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Store, Globe } from "lucide-react";

interface Boutique {
  id: string;
  name: string;
}

export function BoutiqueSwitcher() {
  const { boutiques, isLoading } = useBoutique();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentBoutiqueId = searchParams.get("boutiqueId") || "all";

  const onSelect = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("boutiqueId");
    } else {
      params.set("boutiqueId", value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return <div className="h-11 w-55 animate-pulse bg-muted/20 rounded-2xl" />;
  }

  const currentBoutique = boutiques.find(
    (b: { id: string; name?: string }) => b.id === currentBoutiqueId,
  );

  return (
    <div className="flex items-center gap-3">
      <Select value={currentBoutiqueId} onValueChange={onSelect}>
        <SelectTrigger className="h-11 w-60 bg-background/40 backdrop-blur-xl border-border/40 rounded-2xl font-black text-[10px] tracking-widest transition-all duration-500 shadow-sm hover:shadow-md hover:border-primary/30 group">
          <div className="flex items-center gap-2 truncate">
            {currentBoutiqueId === "all" ? (
              <Globe className="h-3.5 w-3.5 text-primary/40 group-hover:text-primary transition-colors" />
            ) : (
              <Store className="h-3.5 w-3.5 text-orange-500/40 group-hover:text-orange-500 transition-colors" />
            )}
            <span className="truncate italic">
              {currentBoutiqueId === "all"
                ? "Réseau global"
                : currentBoutique?.name || "Boutique"}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-4xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-premium animate-in fade-in zoom-in-95 p-3">
          <SelectItem
            value="all"
            className="font-black text-[10px] tracking-[0.2em] py-4 rounded-xl focus:bg-primary/10 data-[state=checked]:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3" /> Vue Globale
            </div>
          </SelectItem>
          <div className="h-px bg-border/20 my-2 mx-4" />
          {boutiques.map((b: Boutique) => (
            <SelectItem
              key={b.id}
              value={b.id}
              className="font-black text-[9px] tracking-[0.2em] py-4 rounded-xl focus:bg-orange-500/10 data-[state=checked]:bg-orange-500/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Store className="h-3 w-3" /> {b.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
