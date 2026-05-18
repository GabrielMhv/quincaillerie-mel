"use client";

import { useState } from "react";
import {
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  TrendingUp,
  UserCircle,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Client {
  name: string;
  phone: string;
  address: string;
  totalSpent: number;
  orderCount: number;
  lastOrder: string;
}

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Rechercher par nom ou numéro de téléphone..."
          className="h-14 pl-12 pr-6 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 text-lg transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, i) => (
          <div
            key={i}
            className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <UserCircle className="h-8 w-8" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Total Dépensé
                </p>
                <p className="text-xl font-black text-blue-600">
                  {formatCurrency(client.totalSpent)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                  {client.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <Phone className="h-3 w-3" />
                  {client.phone}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{client.address}</span>
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-400">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {client.orderCount} commandes
                </div>
                <div className="text-slate-400 italic">
                  Dernier achat:{" "}
                  {format(new Date(client.lastOrder), "dd/MM/yy")}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="h-20 w-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Search className="h-10 w-10" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white italic">
                Aucun client trouvé
              </p>
              <p className="text-sm text-slate-500">
                Essayez une recherche différente ou vérifiez l&apos;orthographe.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
