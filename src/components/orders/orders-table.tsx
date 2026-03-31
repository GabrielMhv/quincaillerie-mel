"use client";

import { useState } from "react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderStatusUpdater } from "@/components/orders/order-status-updater";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, User, Globe, MapPin, Eye, History } from "lucide-react";
import { OrderDetailsModal } from "./order-details-modal";
import { Order } from "@/types";

interface OrdersTableProps {
  orders: Order[];
  isGlobalScope: boolean;
  currentUserId: string;
  userRole: string;
}

export function OrdersTable({
  orders,
  isGlobalScope,
  currentUserId,
  userRole,
}: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-black text-muted-foreground/40 tracking-tight italic border-b border-border/30 h-16 bg-muted/10">
              <th className="px-8 text-left">Commande</th>
              <th className="px-8 text-left">Client</th>
              <th className="px-8 text-left">Provenance</th>
              {isGlobalScope && (
                <th className="px-8 text-left">Point de vente</th>
              )}
              <th className="px-8 text-left">Montant</th>
              <th className="px-8 text-left">Statut</th>
              <th className="px-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {orders?.map((order) => (
              <tr
                key={order.id}
                className="group hover:bg-primary/2 transition-colors h-24"
              >
                <td className="px-8" onClick={() => handleViewDetails(order)}>
                  <div className="flex flex-col cursor-pointer">
                    <span className="font-black text-primary font-mono text-xs tracking-tighter">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </td>
                <td className="px-8">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black">
                      {order.client_name?.slice(0, 2)}
                    </div>
                    <span className="font-bold whitespace-nowrap">
                      {order.client_name}
                    </span>
                  </div>
                </td>
                <td className="px-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-tight text-muted-foreground/80">
                      {order.source === "passage_boutique"
                        ? "Vente Directe"
                        : order.source === "employe"
                          ? "Par Employé"
                          : order.source === "site_web"
                            ? "Site Web"
                            : order.source?.replace("_", " ")}
                    </span>
                    {order.referred_employee_name && (
                      <span className="text-[10px] font-bold text-primary italic flex items-center gap-1">
                        <User className="h-2.5 w-2.5" />{" "}
                        {order.referred_employee_name}
                      </span>
                    )}
                  </div>
                </td>
                {isGlobalScope && (
                  <td className="px-8">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground/40" />
                      <span className="font-bold text-muted-foreground">
                        {order.boutique?.name}
                      </span>
                    </div>
                  </td>
                )}
                <td className="px-8">
                  <span className="text-lg font-black text-foreground tabular-nums">
                    {formatCurrency(order.total)}
                  </span>
                </td>
                <td className="px-8">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-4 py-1 text-[10px] font-black tracking-tight border-2 transition-all duration-500",
                      order.status === "completed"
                        ? "bg-green-500/10 text-green-600 border-green-500/20 shadow-[0_0_15px_-5px_rgba(34,197,94,0.4)]"
                        : order.status === "pending"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20",
                    )}
                  >
                    {order.status === "completed"
                      ? "Validé"
                      : order.status === "pending"
                        ? "Attente"
                        : "Annulé"}
                  </Badge>
                </td>
                <td className="px-8 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-2xl hover:bg-indigo-100 hover:text-indigo-600 transition-all"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>

                    <Link
                      href={`/order-success?id=${order.id}`}
                      target="_blank"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <FileText className="h-5 w-5" />
                      </Button>
                    </Link>

                    {order.latitude && order.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Voir la localisation"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-2xl hover:bg-emerald-100 hover:text-emerald-600 transition-all"
                        >
                          <MapPin className="h-5 w-5" />
                        </Button>
                      </a>
                    )}

                    {(userRole === "admin" ||
                      userRole === "manager" ||
                      userRole === "employee") && (
                      <OrderStatusUpdater
                        orderId={order.id}
                        currentStatus={order.status}
                        handlerId={order.handler_id}
                        handlerName={order.handler?.name}
                        currentUserId={currentUserId}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr className="h-64">
                <td colSpan={isGlobalScope ? 7 : 6} className="text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                    <History className="h-12 w-12" />
                    <p className="text-sm font-black tracking-tight">
                      Aucune commande enregistrée
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
