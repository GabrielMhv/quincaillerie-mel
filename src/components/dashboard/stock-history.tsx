"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";

interface StockLog {
  id: string;
  product: { name: string; sku?: string };
  boutique: { name: string };
  quantity_changed: number;
  new_quantity: number;
  reason: string;
  created_at: string;
}

export function StockHistory() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("stock_logs")
      .select(
        `
        *,
        product:products(name, sku),
        boutique:boutiques(name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching stock logs:", error);
    } else {
      setLogs((data as unknown as StockLog[]) || []);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        await fetchLogs();
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchLogs]);

  if (isLoading)
    return (
      <div className="h-48 flex items-center justify-center animate-pulse">
        <RefreshCcw className="animate-spin mr-2" /> Chargement de
        l&apos;historique...
      </div>
    );

  return (
    <div className="overflow-hidden">
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800"
        >
          <RefreshCcw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          Actualiser le flux
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="text-[10px] font-black tracking-widest">
                Date
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest">
                Produit
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest">
                Boutique
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest">
                Mouvement
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest">
                Nouveau
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest">
                Raison
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const isPositive = log.quantity_changed > 0;
              return (
                <TableRow
                  key={log.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-50 dark:border-slate-800"
                >
                  <TableCell className="py-6 border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                        {format(new Date(log.created_at), "HH:mm", {
                          locale: fr,
                        })}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 font-mono tracking-widest">
                        {format(new Date(log.created_at), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                        {log.product?.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 font-mono tracking-widest mt-1">
                        Ref: {log.product?.sku || "---"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[11px] font-black tracking-wider text-slate-600 dark:text-slate-400">
                        {log.boutique?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-6 border-slate-50 dark:border-slate-800">
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[11px] tracking-wider",
                        isPositive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
                      )}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {isPositive ? "+" : ""}
                      {log.quantity_changed}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 border-slate-50 dark:border-slate-800 font-mono text-[13px] font-black text-slate-700 dark:text-slate-200">
                    {log.new_quantity}
                  </TableCell>
                  <TableCell className="py-6 border-slate-50 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg tracking-tight">
                      {log.reason}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {logs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-20 text-slate-400 font-medium italic text-sm"
                >
                  Aucun mouvement de stock enregistré
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
