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
import { Badge } from "@/components/ui/badge";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
} from "lucide-react";

interface StockLog {
  id: string;
  product: { name: string };
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
        product:products(name),
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
    <div className="bg-white dark:bg-card border border-border/40 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border/40 flex justify-between items-center bg-muted/20">
        <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> Journal des Mouvements
        </h3>
        <button
          onClick={fetchLogs}
          className="text-xs font-bold text-primary hover:underline"
        >
          Rafraîchir
        </button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="text-[10px] font-black tracking-widest uppercase">
                Date
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest uppercase">
                Produit
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest uppercase">
                Boutique
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest uppercase">
                Mouvement
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest uppercase">
                Nouveau
              </TableHead>
              <TableHead className="text-[10px] font-black tracking-widest uppercase">
                Raison
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="border-border/20">
                <TableCell className="text-xs font-medium">
                  {format(new Date(log.created_at), "dd MMM HH:mm", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell className="text-sm font-bold">
                  {log.product?.name}
                </TableCell>
                <TableCell className="text-xs">{log.boutique?.name}</TableCell>
                <TableCell>
                  <div
                    className={`flex items-center gap-1.5 font-black text-xs ${log.quantity_changed > 0 ? "text-green-600" : "text-rose-600"}`}
                  >
                    {log.quantity_changed > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {log.quantity_changed > 0 ? "+" : ""}
                    {log.quantity_changed}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.new_quantity}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold tracking-tight uppercase px-2 py-0 border-primary/20 bg-primary/5"
                  >
                    {log.reason}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground italic"
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
