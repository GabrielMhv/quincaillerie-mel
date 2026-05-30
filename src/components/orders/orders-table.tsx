"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderStatusUpdater } from "@/components/orders/order-status-updater";
import { History, ShoppingCart } from "lucide-react";
import { PrintOrderButton } from "./print-order-button";
import { OrderDetailsModal } from "./order-details-modal";
import { Order } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface OrdersTableProps {
  orders: Order[];
  isGlobalScope: boolean;
  currentUserId: string;
  userRole: string;
  employees: {
    id: string;
    name: string;
    boutique_id: string | null;
    role: string;
  }[];
  filteredBoutiqueId?: string | null;
}

export function OrdersTable({
  orders,
  currentUserId,
  userRole,
  employees,
  filteredBoutiqueId,
}: OrdersTableProps) {
  const getBadge = (label?: string) => {
    const name = (label || "Global").trim();
    const initials = name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const colors = ["#2563EB", "#6366F1", "#10B981", "#EA580C", "#DC2626"];
    const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    return { initials, color };
  };
  const boutiqueNamesSet = new Set<string>();
  orders?.forEach((o) => {
    if (o.boutique?.name) boutiqueNamesSet.add(o.boutique.name);
    o.order_items?.forEach((it) => {
      if (it.boutique?.name) boutiqueNamesSet.add(it.boutique.name);
    });
  });
  const boutiques = Array.from(boutiqueNamesSet);

  const [selectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="p-4 md:p-6 grid grid-cols-1 gap-8">
        {boutiques.length > 0 && (
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Légende boutiques:</span>
            {boutiques.map((b) => (
              <div
                key={b}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-full px-2 py-1"
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: getBadge(b).color }}
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{b}</span>
              </div>
            ))}
          </div>
        )}
        {orders?.map((order) => {
          return (
            <div
              key={order.id}
              className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-8 relative overflow-hidden"
            >
              {/* Header: ID, Date & Total */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      Commande #{order.id.slice(0, 8)}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-500 border-none rounded-lg px-2 py-0.5 text-[10px] font-bold"
                    >
                      {order.source === "passage_boutique"
                        ? "Boutique"
                        : order.source
                            .split("_")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                    </Badge>

                    {order.boutique?.name && (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-black"
                          style={{ backgroundColor: getBadge(order.boutique.name).color }}
                          title={order.boutique.name}
                        >
                          {getBadge(order.boutique.name).initials}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium lowercase">
                    {formatDistanceToNow(new Date(order.created_at), {
                      locale: fr,
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {formatCurrency(order.total || 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tighter">
                    {order.order_items?.length || 0} articles
                  </p>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div>
                  <h5 className="text-[11px] font-black text-slate-400 tracking-widest mb-2">
                    Détails Client
                  </h5>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {order.client_name || "Table"}
                  </p>
                </div>

                <div>
                  <h5 className="text-[11px] font-black text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                    <History className="h-3 w-3" /> Mode de paiement
                  </h5>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Paiement à la caisse
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <h5 className="text-[11px] font-black text-slate-400  tracking-widest mb-4">
                    Produits commandés
                  </h5>
                  <div className="space-y-3">
                    {(
                      (filteredBoutiqueId
                        ? order.order_items?.filter((it) => it.boutique_id === filteredBoutiqueId)
                        : order.order_items) || []
                    ).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          {/* Show boutique badge per item when order is multi-boutique or item boutique differs */}
                          {(!order.boutique || (item.boutique && item.boutique.name !== order.boutique?.name)) && item.boutique?.name && (
                            <div
                              className="h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                              style={{ backgroundColor: getBadge(item.boutique.name).color }}
                              title={item.boutique.name}
                            >
                              {getBadge(item.boutique.name).initials}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 dark:text-white">{item.quantity}x</span>
                          {" "}
                          {item.product?.name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white italic">
                          {formatCurrency((item.price ?? 0) * (item.quantity ?? 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 space-y-2 border-t border-slate-50 dark:border-slate-800 mt-4 font-medium text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Sous total</span>
                      <span>{formatCurrency(order.total || 0)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 dark:text-white font-black">
                      <span>Total</span>
                      <span>{formatCurrency(order.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <OrderStatusUpdater
                  orderId={order.id}
                  currentStatus={order.status}
                  handlerId={order.handler_id}
                  handlerName={order.handler?.name || null}
                  currentUserId={currentUserId}
                  currentUserRole={userRole}
                  employees={employees}
                />
                  <PrintOrderButton order={order} />
                </div>
              </div>
            </div>
          );
        })}

        {(!orders || orders.length === 0) && (
          <div className="col-span-full h-80 flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="h-16 w-16 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-300">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Aucune commande trouvée
              </p>
              <p className="text-xs font-bold text-slate-400 tracking-widest mt-2">
                Essayez de modifier vos filtres
              </p>
            </div>
          </div>
        )}
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        filteredBoutiqueId={filteredBoutiqueId}
      />
    </>
  );
}
