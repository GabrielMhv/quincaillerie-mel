"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Trash2,
  Search,
  Bell,
  Info,
  AlertTriangle,
  Package,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/app/actions/notifications";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  /* ... existing code ... */
}

export function NotificationsList({
  initialNotifications,
  userBoutiqueId,
}: {
  initialNotifications: Notification[];
  userBoutiqueId: string | null;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "all";
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("new-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: { new: { boutique_id: string | null; title: string; message: string } }) => {
          // Si c'est pour notre boutique ou si on est admin (boutique_id est null/all)
          if (!userBoutiqueId || payload.new.boutique_id === userBoutiqueId) {
            toast.info(`Nouvelle alerte : ${payload.new.title}`, {
              description: payload.new.message,
              icon: <Bell className="h-4 w-4 text-orange-500" />,
            });
            router.refresh();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userBoutiqueId, router]);

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id);
    if (res.error) toast.error(res.error);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await deleteNotification(id);
    if (res.error) toast.error(res.error);
    else toast.success("Notification supprimée");
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead(userBoutiqueId);
    if (res.error) toast.error(res.error);
    else toast.success("Toutes les notifications sont lues");
  };

  const filteredNotifications = initialNotifications.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()),
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "out_of_stock":
        return <Package className="h-5 w-5 text-rose-500" />;
      case "transfer":
        return <CheckCircle2 className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full md:w-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/notifications?filter=all")}
            className={cn(
              "rounded-xl px-6 font-bold text-sm",
              currentFilter === "all" && "bg-white dark:bg-slate-700 shadow-sm",
            )}
          >
            Toutes
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              router.push("/dashboard/notifications?filter=unread")
            }
            className={cn(
              "rounded-xl px-6 font-bold text-sm",
              currentFilter === "unread" &&
                "bg-white dark:bg-slate-700 shadow-sm",
            )}
          >
            Non lues
          </Button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-2xl bg-slate-50 border-none h-11 font-medium"
          />
        </div>

        <Button
          onClick={handleMarkAllRead}
          variant="outline"
          className="rounded-2xl font-bold border-slate-200 dark:border-slate-800 h-11 px-6 whitespace-nowrap"
        >
          Tout marquer comme lu
        </Button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium italic">
              Aucune notification trouvée.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() =>
                !notification.is_read && handleMarkAsRead(notification.id)
              }
              className={cn(
                "group relative bg-white dark:bg-slate-900 p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden",
                notification.is_read
                  ? "border-slate-100 dark:border-slate-800 opacity-70"
                  : "border-indigo-500/20 bg-indigo-500/[0.02] shadow-sm hover:shadow-md",
              )}
            >
              {!notification.is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
              )}

              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    notification.is_read
                      ? "bg-slate-100"
                      : "bg-white shadow-sm border border-slate-100",
                  )}
                >
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3
                      className={cn(
                        "font-black tracking-tight",
                        notification.is_read
                          ? "text-slate-600"
                          : "text-slate-900 dark:text-white",
                      )}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(notification.created_at), "HH:mm", {
                          locale: fr,
                        })}
                      </span>
                      <button
                        onClick={(e) => handleDelete(notification.id, e)}
                        className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full text-[10px] font-black uppercase tracking-wider py-0 px-2 bg-slate-50 text-slate-400 border-slate-100"
                    >
                      {format(
                        new Date(notification.created_at),
                        "d MMMM yyyy",
                        { locale: fr },
                      )}
                    </Badge>
                    {notification.boutique && (
                      <Badge className="rounded-full text-[10px] font-black uppercase tracking-wider py-0 px-2 bg-indigo-500/10 text-indigo-600 border-none">
                        {notification.boutique.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
