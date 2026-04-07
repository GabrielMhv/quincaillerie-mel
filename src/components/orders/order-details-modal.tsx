"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Calendar,
  Store,
  Globe,
  PackageOpen,
  CreditCard,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Order } from "@/types";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onOpenChange,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-275 w-[95vw] rounded-[3rem] border-none shadow-3xl overflow-hidden p-0 bg-transparent gap-0">
        <div className="relative bg-white/95 dark:bg-card/95 backdrop-blur-2xl border border-white/20 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 -ml-32 -mb-32" />

          <div className="p-8 sm:p-10 space-y-10">
            <DialogHeader>
              <div className="flex justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <PackageOpen className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-4xl font-black tracking-tighter leading-none">
                      Détails <span className="text-gradient">Commande</span>
                    </DialogTitle>
                    <p className="text-[10px] font-mono font-bold text-muted-foreground opacity-40 italic tracking-tight">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-2xl px-6 py-2 text-[10px] font-black tracking-tight border-2 transition-all duration-500 shadow-lg ${
                    order.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/10"
                      : order.status === "pending"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/10"
                        : "bg-rose-500/10 text-rose-600 border-rose-500/20 shadow-rose-500/10"
                  }`}
                >
                  {order.status === "completed"
                    ? "Livrée"
                    : order.status === "pending"
                      ? "En attente"
                      : "Annulée"}
                </Badge>
                {order.is_scheduled && (
                  <Badge
                    variant="outline"
                    className="ml-2 rounded-2xl px-6 py-2 text-[10px] font-black tracking-tight border-2 border-primary/20 bg-primary/5 text-primary"
                  >
                    Programmé
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Info & Summary */}
              <div className="lg:col-span-5 space-y-10">
                {/* Client & Logistics Combined */}
                <div className="space-y-8 p-8 rounded-[2.5rem] bg-secondary/10 border border-border/50">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black tracking-tight text-muted-foreground/40 flex items-center gap-2 border-l-4 border-primary pl-4">
                      Client & Livraison
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                        {order.client_name?.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-black text-xl tracking-tight leading-none mb-1">
                          {order.client_name}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground opacity-60 flex items-center gap-2">
                          <Phone className="h-3 w-3" /> {order.phone}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pl-4 border-l-2 border-border/30 ml-6 py-1">
                      {order.address && (
                        <div className="flex items-start gap-4 text-xs text-muted-foreground/80 leading-relaxed font-medium">
                          <MapPin className="h-3.5 w-3.5 opacity-40 shrink-0 mt-0.5" />
                          <span>{order.address}</span>
                        </div>
                      )}
                      {order.latitude && order.longitude && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black tracking-tight hover:bg-emerald-500/20 transition-all mt-1"
                        >
                          <Globe className="h-3.5 w-3.5" /> Voir sur Maps
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border/30 mx-4" />

                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black tracking-tight text-muted-foreground/40 flex items-center gap-2 border-l-4 border-indigo-500 pl-4">
                      Informations logistique
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          icon: Calendar,
                          label: "Date",
                          value: formatDate(order.created_at),
                        },
                        {
                          icon: Store,
                          label: "Boutique",
                          value: order.boutique?.name || "N/A",
                        },
                        {
                          icon: ShoppingBag,
                          label: "Source",
                          value: order.source?.replace("_", " "),
                        },
                        ...(order.is_scheduled
                          ? [
                              {
                                icon: Calendar,
                                label: "Retrait prévu",
                                value: order.scheduled_at
                                  ? formatDate(order.scheduled_at)
                                  : "Non défini",
                              },
                            ]
                          : []),
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <p className="text-[8px] font-bold text-muted-foreground/40 tracking-tight">
                            {item.label}
                          </p>
                          <p className="font-black text-[11px] capitalize">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {order.referred_employee_name && (
                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
                        <User className="h-4 w-4 text-indigo-500 opacity-40" />
                        <p className="text-[10px] font-bold text-indigo-600 italic">
                          Apporteur :{" "}
                          <span className="tracking-tight not-italic">
                            {order.referred_employee_name}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Final */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-linear-to-r from-primary via-indigo-600 to-primary rounded-[2.5rem] blur-xl opacity-20" />
                  <div className="relative flex flex-col justify-center gap-4 p-8 rounded-[2.5rem] bg-indigo-950 border border-white/10 text-white shadow-2xl overflow-hidden min-h-35">
                    <div className="space-y-1 relative z-10 w-full">
                      <span className="text-[8px] font-black tracking-tight text-white/40 flex items-center gap-2">
                        <CreditCard className="h-3 w-3" /> Total final
                      </span>
                    </div>
                    <div className="relative z-10 w-full overflow-hidden text-right">
                      <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-tighter antialiased drop-shadow-lg wrap-break-word">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Items List */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex justify-between items-end border-b border-border/50 pb-4">
                  <h4 className="text-[10px] font-black tracking-tight text-muted-foreground/40 flex items-center gap-2">
                    Articles ({order.order_items?.length || 0})
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground/40 italic">
                    Panier détaillé
                  </p>
                </div>

                <ScrollArea className="h-107.5 pr-4">
                  <div className="space-y-3">
                    {order.order_items?.map((item, idx: number) => (
                      <div
                        key={idx}
                        className="group relative flex justify-between items-center p-4 rounded-2xl bg-secondary/5 hover:bg-white dark:hover:bg-card hover:shadow-lg transition-all border border-transparent hover:border-border/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 font-black text-xs">
                            {idx + 1}
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">
                              {item.product?.name || "Produit supprimé"}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="secondary"
                                className="rounded-lg px-2 py-0 text-[8px] font-bold tracking-tight bg-muted/40 border-none"
                              >
                                Qté: {item.quantity}
                              </Badge>
                              <span className="text-[9px] font-bold text-muted-foreground/40">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="font-black text-base tabular-nums tracking-tighter">
                          {formatCurrency(item.quantity * item.price)}
                        </p>
                      </div>
                    ))}
                    {(!order.order_items || order.order_items.length === 0) && (
                      <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                        <PackageOpen className="h-12 w-12 mb-4" />
                        <p className="text-sm font-black tracking-tight italic">
                          Aucun article enregistré
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
