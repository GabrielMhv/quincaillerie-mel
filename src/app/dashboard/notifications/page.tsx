import { createClient } from "@/lib/supabase/server";
import {
  Bell,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Package,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { redirect } from "next/navigation";

export default async function NotificationsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const filter = (searchParams.filter as string) || "all";
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, boutique_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Centre de Notifications
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Restez informÃ© des activitÃ©s de vos boutiques
          </p>
        </div>
      </div>

      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsContent 
          userRole={profile.role} 
          userBoutiqueId={profile.boutique_id} 
          filter={filter}
        />
      </Suspense>
    </div>
  );
}

async function NotificationsContent({ 
  userRole, 
  userBoutiqueId,
  filter 
}: { 
  userRole: string; 
  userBoutiqueId: string | null;
  filter: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("notifications")
    .select("*, boutique:boutiques(name)")
    .order("created_at", { ascending: false });

  if (userRole !== "admin" && userBoutiqueId) {
    query = query.eq("boutique_id", userBoutiqueId);
  }

  if (filter === "unread") {
    query = query.eq("is_read", false);
  }

  const { data: notifications } = await query;

  return (
    <NotificationsList 
      initialNotifications={notifications || []} 
      userBoutiqueId={userBoutiqueId}
    />
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      ))}
    </div>
  );
}
