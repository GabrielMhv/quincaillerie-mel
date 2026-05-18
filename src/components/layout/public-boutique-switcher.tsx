"use client";

import { useBoutique } from "@/components/providers/boutique-provider";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function PublicBoutiqueSwitcher() {
  const { boutiques, selectedBoutique, setSelectedBoutique, isLoading } =
    useBoutique();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleBoutiqueChange = (val: string) => {
    const b = boutiques.find((bout) => bout.id === val);
    if (b) {
      startTransition(() => {
        setSelectedBoutique(b);
        const params = new URLSearchParams(searchParams.toString());
        params.set("boutiqueId", b.id);
        router.push(`${pathname}?${params.toString()}`);
      });
    }
  };

  if (isLoading) {
    return <div className="h-13 w-full animate-pulse bg-muted rounded-3xl" />;
  }

  return (
    <div className="relative group w-full">
      <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative p-1 rounded-3xl bg-white dark:bg-card/80 border border-slate-200 dark:border-white/10 flex items-center gap-3 px-5 h-13 hover:bg-slate-50 dark:hover:bg-card transition-all cursor-pointer shadow-sm overflow-hidden">
        <div className="bg-primary/10 p-2 rounded-xl text-primary">
          <MapPin className="h-4 w-4" />
        </div>
        <Select
          value={selectedBoutique?.id || ""}
          disabled={isPending}
          onValueChange={handleBoutiqueChange}
        >
          <SelectTrigger
            className={cn(
              "border-none bg-transparent h-full p-0 shadow-none focus:ring-0 w-full text-[13px] font-bold tracking-tight text-foreground/80 hover:text-foreground transition-colors pr-4",
              isPending && "opacity-50 cursor-wait",
            )}
          >
            <span className="truncate text-left ml-2">
              {isPending
                ? "Mise à jour..."
                : selectedBoutique?.name || "Choisir une boutique"}
            </span>
          </SelectTrigger>
          <SelectContent
            align="start"
            sideOffset={12}
            className="glass border-border/50 rounded-3xl p-2 shadow-2xl animate-in fade-in zoom-in duration-200 min-w-[280px]"
          >
            <div className="px-4 py-2 mb-1">
              <p className="text-[10px] font-black text-primary tracking-widest uppercase mb-1">
                Points de vente
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                Sélecteur de boutique locale
              </p>
            </div>
            {boutiques.map((b) => (
              <SelectItem
                key={b.id}
                value={b.id}
                className={cn(
                  "rounded-2xl text-[14px] font-bold tracking-tight my-1 p-3 focus:bg-primary/10 focus:text-primary transition-all border border-transparent cursor-pointer",
                  selectedBoutique?.id === b.id &&
                    "bg-primary/5 border-primary/20 text-primary",
                )}
              >
                <div className="flex items-center gap-3 py-1">
                  <MapPin
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selectedBoutique?.id === b.id
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="truncate">{b.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
