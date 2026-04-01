"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Package,
  Info,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  boutique_id?: string;
  metadata?: Record<string, unknown>;
  boutique?: { name: string };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [boutiqueId, setBoutiqueId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, boutique_id")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUserRole(profile.role);
            setBoutiqueId(profile.boutique_id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    }
    getSession();
  }, [supabase]);

  const fetchNotifications = async () => {
    if (!userRole) return;

    setLoading(true);
    try {
      let query = supabase
        .from("notifications")
        .select("*, boutique:boutiques(name)")
        .order("created_at", { ascending: false });

      if (userRole !== "admin" && boutiqueId) {
        query = query.eq("boutique_id", boutiqueId);
      }

      if (filter === "unread") {
        query = query.eq("is_read", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (error: unknown) {
      toast.error("Erreur lors du chargement des notifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel("public:notifications_page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload: { new: Notification }) => {
          const newNotif = payload.new;

          // Check if relevant for this user
          const isRelevant =
            userRole === "admin" ||
            (boutiqueId && newNotif.boutique_id === boutiqueId);

          if (isRelevant) {
            setNotifications((prev) => [newNotif, ...prev]);
            if (!newNotif.is_read) {
              toast.info(newNotif.title, { description: newNotif.message });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, filter, boutiqueId]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      let query = supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (userRole !== "admin" && boutiqueId) {
        query = query.eq("boutique_id", boutiqueId);
      }

      const { error } = await query;
      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      toast.error("Erreur lors de l'opération");
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification supprimée");
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    try {
      await markAsRead(n.id);

      const type = n.type?.toLowerCase();

      if (type === "new_order" || type === "order") {
        router.push("/dashboard/orders");
      } else if (type === "low_stock" || type === "stock") {
        router.push("/dashboard/stocks");
      } else if (type === "transfer_request" || type === "transfer") {
        router.push("/dashboard/stocks/transfers");
      } else {
        toast.info(n.title, { description: n.message });
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_order":
        return <Package className="h-5 w-5 text-primary" />;
      case "low_stock":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "transfer_request":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()) ||
      n.boutique?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-tight">
              Centre de{" "}
              <span className="text-gradient leading-relaxed">
                Notifications
              </span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium italic">
            Historique complet des activités et alertes système.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-primary/20 h-14 px-6 hover:bg-primary/5 font-black tracking-tight"
            onClick={markAllAsRead}
            disabled={!notifications.some((n) => !n.is_read)}
          >
            <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
            Tout marquer comme lu
          </Button>
        </div>
      </section>

      {/* Main Content Card */}
      <div className="rounded-[3rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-8 border-b border-border/50 bg-muted/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une notification..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-14 pr-6 rounded-2xl bg-muted/30 border-border/50 focus:ring-primary/20 focus:border-primary/40 font-bold"
            />
          </div>

          <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/50">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all",
                filter === "all"
                  ? "bg-white text-primary shadow-sm ring-1 ring-border/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              TOUTES
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all",
                filter === "unread"
                  ? "bg-white text-primary shadow-sm ring-1 ring-border/20"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              NON LUES
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="min-h-125">
          {loading ? (
            <div className="flex h-125 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                <p className="text-xs font-black tracking-widest text-muted-foreground/40 italic uppercase">
                  Syncronisation du flux...
                </p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex h-125 flex-col items-center justify-center text-center p-12">
              <div className="h-24 w-24 rounded-[2.5rem] bg-muted/30 border border-border/50 flex items-center justify-center mb-6">
                <Bell className="h-10 w-10 text-muted-foreground/20" />
              </div>
              <p className="text-xl font-black tracking-tight mb-2">
                Historique vide
              </p>
              <p className="text-sm text-muted-foreground max-w-xs font-medium italic">
                {search
                  ? "Aucune notification ne correspond à votre recherche."
                  : "Vous n'avez pas encore reçu de notifications."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "group relative p-8 hover:bg-muted/30 transition-all duration-500 cursor-pointer",
                    !n.is_read && "bg-primary/2",
                  )}
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Status Icon */}
                    <div className="mt-1 relative shrink-0">
                      <div
                        className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
                          n.is_read
                            ? "bg-muted/30 border-border/50"
                            : "bg-primary/10 border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]",
                        )}
                      >
                        {getIcon(n.type)}
                      </div>
                      {!n.is_read && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-4 border-card animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4
                          className={cn(
                            "text-xl tracking-tight transition-colors",
                            n.is_read
                              ? "font-bold text-foreground/70"
                              : "font-black text-foreground",
                          )}
                        >
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black tracking-widest uppercase px-2 py-0.5">
                            Nouveau
                          </Badge>
                        )}
                        {n.boutique?.name && (
                          <Badge
                            variant="outline"
                            className="text-[10px] h-5 rounded-lg bg-muted text-muted-foreground border-border/50 font-bold"
                          >
                            {n.boutique.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed font-medium">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-6 text-[11px] font-bold tracking-tight text-muted-foreground/40">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          {format(
                            new Date(n.created_at),
                            "eeee d MMMM 'à' HH:mm",
                            { locale: fr },
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 opacity-40 text-primary" />
                          {n.type.replace("_", " ").toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleNotificationClick(n)}
                        title="Ouvrir la ressource"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {!n.is_read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                          onClick={() => markAsRead(n.id)}
                          title="Marquer comme lu"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => deleteNotification(n.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-8 border-t border-border/50 bg-muted/30">
          <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/40 text-center uppercase">
            Système de surveillance en temps réel • Ets La Championne
          </p>
        </div>
      </div>
    </div>
  );
}
