"use client";

import { useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { OrderStatusUpdater } from "@/components/orders/order-status-updater";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  Globe,
  MapPin,
  Eye,
  History,
  Clock,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { OrderDetailsModal } from "./order-details-modal";
import { Order } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "site_web":
        return <Globe className="h-3 w-3" />;
      case "passage_boutique":
        return <ShoppingBag className="h-3 w-3" />;
      case "employe":
        return <User className="h-3 w-3" />;
      default:
        return <ShoppingCart className="h-3 w-3" />;
    }
  };

  const currentStep = (status: string) => {
    if (status === "pending") return 1;
    if (status === "completed") return 3;
    return 0; // Cancelled
  };

  return (
    <>
      <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {orders?.map((order) => {
          const step = currentStep(order.status);

          return (
            <div
              key={order.id}
              className="group bg-background border border-border/50 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full bg-primary/5 text-primary border-primary/20 font-mono font-black text-[10px] tracking-tight px-3"
                    >
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full flex items-center gap-1.5 py-1 px-3 text-[10px] font-bold"
                    >
                      {getSourceIcon(order.source)}
                      {order.source.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground/60">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-black italic">
                      il y a{" "}
                      {formatDistanceToNow(new Date(order.created_at), {
                        locale: fr,
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black tracking-tighter tabular-nums leading-none">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 tracking-widest">
                    {order.order_items?.length || 0} Articles
                  </p>
                </div>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-3xl border border-border/30">
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-xs font-black shadow-inner">
                  {order.client_name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm truncate tracking-tight">
                    {order.client_name}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground/60 truncate flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />{" "}
                    {order.address || "Aucune adresse spécifiée"}
                  </p>
                </div>
                {isGlobalScope && (
                  <div className="px-3 py-1.5 bg-orange-500/5 border border-orange-500/10 rounded-xl text-right">
                    <p className="text-[8px] font-black text-orange-600/60 tracking-widest">
                      Magasin
                    </p>
                    <p className="text-[10px] font-black text-orange-700">
                      {order.boutique?.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="px-2 mt-2">
                <div className="relative flex justify-between items-center w-full">
                  {/* Background Line */}
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted/30 -translate-y-1/2 z-0" />

                  {/* Progress Line */}
                  {order.status !== "cancelled" && (
                    <div
                      className={cn(
                        "absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-1000 ease-in-out",
                        step === 1 ? "w-0" : step === 3 ? "w-full" : "w-1/2",
                      )}
                    />
                  )}

                  {/* Steps */}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 transition-all duration-500",
                        step >= 1
                          ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/40"
                          : "bg-background border-muted",
                      )}
                    />
                    <span className="text-[8px] font-black  text-muted-foreground tracking-widest">
                      En attente
                    </span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 transition-all duration-500",
                        step >= 2
                          ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/40"
                          : "bg-background border-muted",
                        order.status === "cancelled" &&
                          "border-rose-500 bg-rose-500 shadow-rose-500/40",
                      )}
                    />
                    <span className="text-[8px] font-black  text-muted-foreground tracking-widest">
                      {order.status === "cancelled" ? "Annulé" : "En cours"}
                    </span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 transition-all duration-500",
                        step === 3
                          ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/40"
                          : "bg-background border-muted",
                      )}
                    />
                    <span className="text-[8px] font-black text-muted-foreground tracking-widest">
                      Livré
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl hover:bg-indigo-100 hover:text-indigo-600 transition-all shadow-sm bg-indigo-50/50"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>

                  <Link href={`/order-success?id=${order.id}`} target="_blank">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all shadow-sm bg-primary/5"
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
                        className="h-10 w-10 rounded-2xl hover:bg-emerald-100 hover:text-emerald-600 transition-all shadow-sm bg-emerald-50/50"
                      >
                        <MapPin className="h-5 w-5" />
                      </Button>
                    </a>
                  )}
                </div>

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
            </div>
          );
        })}

        {(!orders || orders.length === 0) && (
          <div className="col-span-full h-96 flex flex-col items-center justify-center space-y-6 bg-muted/20 border border-dashed border-border/60 rounded-[3rem]">
            <div className="h-24 w-24 rounded-[2rem] bg-background shadow-xl flex items-center justify-center text-muted-foreground/20 animate-pulse">
              <History className="h-12 w-12" />
            </div>
            <div className="text-center">
              <p className="text-xl font-black tracking-tight text-muted-foreground/40">
                Aucune commande trouvée
              </p>
              <p className="text-xs font-bold text-muted-foreground/20  tracking-widest mt-2">
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
      />
    </>
  );
}
