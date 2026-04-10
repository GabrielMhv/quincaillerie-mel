import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Mail,
  Calendar,
  ShoppingBag,
  MapPin,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

import { DeleteAccountButton } from "@/components/profile/delete-account-button";
import {
  ProfileForm,
  PasswordChangeForm,
} from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch complete profile info from public.users
  const { data: profile } = await supabase
    .from("users")
    .select("*, boutiques(name)")
    .eq("id", user.id)
    .single();

  // Fetch recent orders related to this user (as employee/manager)
  const { data: myOrders } = await supabase
    .from("orders")
    .select("*, boutiques(name)")
    .eq("employee_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  interface Order {
    id: string;
    created_at: string;
    total: number;
    status: string;
    boutiques: {
      name: string;
    } | null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">
            Terminée
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-amber-600 border-amber-600/20 bg-amber-500/10 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase"
          >
            En attente
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="destructive"
            className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase"
          >
            Annulée
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase"
          >
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Profile Banner */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-12 rounded-[3.5rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden group shadow-premium">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-175 group-hover:rotate-0 transition-all duration-700">
          <Shield className="h-60 w-60 text-indigo-600" />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="h-40 w-40 rounded-[3rem] bg-indigo-500/10 p-1 flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden">
              <Avatar className="h-full w-full rounded-[2.8rem]">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-black bg-indigo-500 text-white">
                  {profile?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg border-4 border-indigo-50">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <h1 className="text-5xl font-black tracking-tighter leading-none italic">
                {profile?.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center pt-2">
                <Badge className="bg-white/80 backdrop-blur-md text-indigo-600 border-indigo-100 rounded-full px-5 py-1 text-xs font-black tracking-tight shadow-sm">
                  {profile?.role === "admin"
                    ? "Administrateur Global"
                    : profile?.role === "manager"
                      ? "Manager Boutique"
                      : "Employé"}
                </Badge>
                {profile?.boutiques?.name && (
                  <div className="flex items-center gap-2 text-indigo-600/60 font-black tracking-tighter italic text-sm">
                    <MapPin className="h-4 w-4" />
                    {profile.boutiques.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative z-10">
          <ProfileForm
            initialData={{
              full_name: profile?.full_name || profile?.name || "",
              phone: profile?.phone,
              avatar_url: profile?.avatar_url,
            }}
          />
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Info Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-[3.5rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium p-10 relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="flex flex-col space-y-8 relative z-10">
              <h3 className="text-xs font-black tracking-tight text-muted-foreground flex items-center gap-3">
                <User className="h-4 w-4 text-primary" /> Informations vérifiées
              </h3>

              <div className="grid gap-8">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/5">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground/40 tracking-tight mb-1">
                      Email professionnel
                    </p>
                    <p className="font-bold text-lg tracking-tight">
                      {profile?.email || user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/5">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground/40 tracking-tight mb-1">
                      Membre Premium depuis
                    </p>
                    <p className="font-bold text-lg tracking-tight italic">
                      {profile?.created_at
                        ? format(new Date(profile.created_at), "PP", {
                            locale: fr,
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-border/40 flex flex-col gap-5">
                <PasswordChangeForm />
                <DeleteAccountButton userId={user.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden h-full flex flex-col hover:border-primary/20 transition-all">
            <div className="p-10 border-b border-border/50 bg-muted/20 flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight text-foreground flex items-center gap-3 italic">
                  <ShoppingBag className="h-6 w-6 text-primary" /> Activité
                  Récente
                </h3>
                <p className="text-[10px] font-black text-muted-foreground/60 tracking-tight">
                  Historique des transactions personnelles
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-black text-muted-foreground/40 tracking-tight border-b border-border/20 h-20">
                    <th className="px-10 text-left underline decoration-primary/30 underline-offset-8">
                      Date
                    </th>
                    <th className="px-10 text-left">Boutique</th>
                    <th className="px-10 text-left">Montant total</th>
                    <th className="px-10 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {myOrders?.map((order: Order) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-primary/5 transition-colors h-28 cursor-default"
                    >
                      <td className="px-10">
                        <p className="font-extrabold text-lg tracking-tighter text-foreground group-hover:text-primary transition-colors">
                          {format(new Date(order.created_at), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                        <p className="text-[10px] font-black text-muted-foreground/40 italic">
                          À {format(new Date(order.created_at), "HH:mm")}
                        </p>
                      </td>
                      <td className="px-10">
                        <div className="flex items-center gap-2 font-bold text-muted-foreground group-hover:text-foreground">
                          <MapPin className="h-4 w-4 text-primary/50" />
                          {order.boutiques?.name || "Siège Social"}
                        </div>
                      </td>
                      <td className="px-10">
                        <p className="font-black text-xl tracking-tighter text-indigo-600 italic">
                          {Number(order.total).toLocaleString()}
                          <span className="text-xs ml-1 font-bold not-italic">
                            FCFA
                          </span>
                        </p>
                      </td>
                      <td className="px-10 text-right">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                  {!myOrders?.length && (
                    <tr className="flex-1 min-h-120">
                      <td colSpan={4} className="h-120 text-center">
                        <div className="flex flex-col items-center justify-center space-y-6 opacity-30 grayscale saturate-0">
                          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
                          <p className="text-2xl font-black tracking-widest text-center italic leading-none">
                            Historique
                            <br />
                            Vierge
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-border/30 bg-muted/10 text-center">
              <p className="text-[10px] font-black tracking-tight text-muted-foreground opacity-50 italic">
                La Championne Multi-Boutiques • Sécurisé par Supabase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
