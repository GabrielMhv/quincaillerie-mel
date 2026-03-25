"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Bell,
  Circle,
  Package,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

let notificationAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

// We use a reliable, light "ping" UI sound URL
const SOUND_URL =
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const playNotificationSound = () => {
  if (!notificationAudio) return;
  notificationAudio.currentTime = 0;
  notificationAudio.play().catch((err) => console.warn("Audio bloqué:", err));
};

export function NotificationBell({
  userRole,
  boutiqueId,
}: {
  userRole: string;
  boutiqueId?: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  // Initialize and unlock audio on first mount/interaction
  useEffect(() => {
    if (typeof window !== "undefined" && !notificationAudio) {
      notificationAudio = new Audio(SOUND_URL);
      notificationAudio.volume = 0.5;

      const unlockAudio = () => {
        if (!audioUnlocked && notificationAudio) {
          notificationAudio
            .play()
            .then(() => {
              notificationAudio!.pause();
              notificationAudio!.currentTime = 0;
              audioUnlocked = true;
            })
            .catch(() => {});

          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
        }
      };

      window.addEventListener("click", unlockAudio);
      window.addEventListener("keydown", unlockAudio);
      window.addEventListener("touchstart", unlockAudio);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    let query = supabase
      .from("notifications")
      .select("*, boutique:boutiques(name)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (userRole !== "admin" && boutiqueId) {
      query = query.eq("boutique_id", boutiqueId);
    }

    const { data } = await query;
    if (data) {
      setNotifications(data as Notification[]);
      setUnreadCount((data as Notification[]).filter((n) => !n.is_read).length);
    }
  }, [supabase, userRole, boutiqueId]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("public:notifications")
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
          if (
            userRole === "admin" ||
            (boutiqueId && newNotif.type !== "low_stock" && newNotif.id)
          ) {
            setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
            setUnreadCount((c) => c + 1);
            toast.info(newNotif.title, { description: newNotif.message });
            playNotificationSound();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, boutiqueId, supabase, fetchNotifications]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", n.id);

      if (!error) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, is_read: true } : item,
          ),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    }

    // Redirect based on type
    const type = n.type?.toLowerCase();
    if (type === "new_order" || type === "order") {
      router.push("/dashboard/orders");
    } else if (type === "low_stock" || type === "stock") {
      router.push("/dashboard/stocks");
    } else if (type === "transfer_request" || type === "transfer") {
      router.push("/dashboard/stocks/transfers");
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
      setUnreadCount(0);
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      console.error(error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_order":
        return <Package className="h-4 w-4 text-primary" />;
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "transfer_request":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[320px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {unreadCount} nouvelles
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-emerald-500/10 hover:text-emerald-500"
              onClick={markAllAsRead}
              title="Tout marquer comme lu"
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="max-h-87.5 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm italic">Aucune notification</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer relative",
                  !n.is_read && "bg-primary/5",
                )}
                onClick={() => handleNotificationClick(n)}
              >
                {!n.is_read && (
                  <Circle className="absolute right-4 top-4 h-2 w-2 fill-primary text-primary" />
                )}
                <div className="flex gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full border bg-background flex items-center justify-center shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-xs font-bold leading-none mb-1",
                        !n.is_read && "text-primary",
                      )}
                    >
                      {n.title}
                    </p>
                    {userRole === "admin" && n.boutique?.name && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 px-1 py-0 bg-primary/5 text-primary border-primary/20 mb-1"
                      >
                        {n.boutique.name}
                      </Badge>
                    )}
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 italic">
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => router.push("/dashboard/notifications")}
            >
              Voir tout l&apos;historique
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
