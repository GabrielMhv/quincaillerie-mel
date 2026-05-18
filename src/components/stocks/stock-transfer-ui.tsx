"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Plus,
  History,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Transfer {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  quantity: number;
  product: { name: string };
  from_boutique: { name: string };
  to_boutique: { name: string };
}

export function StockTransferUI({ transfers }: { transfers: Transfer[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = transfers.filter((t) =>
    t.product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un transfert..."
            className="pl-10 h-11 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="w-full md:w-auto gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
          <ArrowRightLeft className="h-4 w-4" />
          Nouveau Transfert
        </Button>
      </div>

      {/* Transfers List */}
      <div className="grid gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    t.status === "approved"
                      ? "bg-green-50 text-green-600"
                      : t.status === "rejected"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {t.status === "approved" ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : t.status === "rejected" ? (
                    <XCircle className="h-6 w-6" />
                  ) : (
                    <Clock className="h-6 w-6 animate-pulse" />
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {t.product.name}
                    <span className="text-blue-600">x{t.quantity}</span>
                  </h4>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">
                    {t.from_boutique.name}{" "}
                    <ArrowRightLeft className="inline h-3 w-3 mx-1" />{" "}
                    {t.to_boutique.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {format(new Date(t.created_at), "dd MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1 capitalize ${
                      t.status === "approved"
                        ? "border-green-200 text-green-700 bg-green-50"
                        : t.status === "rejected"
                          ? "border-rose-200 text-rose-700 bg-rose-50"
                          : "border-amber-200 text-amber-700 bg-amber-50"
                    }`}
                  >
                    {t.status === "approved"
                      ? "Effectué"
                      : t.status === "rejected"
                        ? "Refusé"
                        : "En attente"}
                  </Badge>
                </div>
                {t.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:bg-green-50"
                    >
                      Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl border-slate-100">
            <History className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              Aucun mouvement de stock historique
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
