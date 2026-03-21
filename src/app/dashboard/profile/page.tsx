import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Calendar, ShoppingBag, MapPin, User as UserIcon, Shield, Sparkles } from "lucide-react";

import { DeleteAccountButton } from "@/components/profile/delete-account-button";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile with boutique info
  const { data: profile } = await supabase
    .from("users")
    .select("*, boutiques(name)")
    .eq("id", user.id)
    .single();

  // Fetch personal orders
  const { data: myOrders } = await supabase
    .from("orders")
    .select("*, boutiques(name)")
    .or(`client_name.ilike.%${profile?.name}%,phone.eq.${user.phone || "none"}`)
    .order("created_at", { ascending: false });

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
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest">Terminée</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-600/20 bg-amber-500/10 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest">En attente</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest">Annulée</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter leading-tight">
             Identité <span className="text-gradient leading-relaxed">Numérique</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium italic">
            Gérez vos informations personnelles et historique d&apos;activité
          </p>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* User Card - LEFT */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[3.5rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-colors">
               <Shield className="h-20 w-20" />
            </div>
            
            <div className="flex flex-col items-center text-center space-y-6 relative z-10">
              <div className="relative">
                <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-secondary/20 p-1 flex items-center justify-center border border-primary/20 shadow-lg">
                  <Avatar className="h-full w-full rounded-[2.2rem]">
                    <AvatarFallback className="text-3xl font-black bg-background text-primary">
                      {profile?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md border-4 border-card">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">{profile?.name}</h2>
                <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest italic">
                  {profile?.role === 'admin' ? 'Administrateur' : profile?.role === 'manager' ? 'Manager' : profile?.role === 'employee' ? 'Employé' : 'Client'}
                </Badge>
              </div>

              <div className="w-full space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm">
                  <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-muted-foreground/50 tracking-widest uppercase mb-0.5">Email</p>
                     <p className="font-bold">{profile?.email}</p>
                  </div>
                </div>
                {profile?.boutiques && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-muted-foreground/50 tracking-widest uppercase mb-0.5">Affectation</p>
                       <p className="font-bold">{profile.boutiques.name}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1">
                     <p className="text-[10px] font-black text-muted-foreground/50 tracking-widest uppercase mb-0.5">Membre depuis</p>
                     <p className="font-bold">{profile?.created_at ? format(new Date(profile.created_at), "PP", { locale: fr }) : "-"}</p>
                  </div>
                </div>
              </div>

              <div className="w-full pt-8">
                <DeleteAccountButton userId={user.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table - RIGHT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden h-full flex flex-col">
            <div className="p-10 border-b border-border/50 bg-muted/30 flex justify-between items-center">
               <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
                 <ShoppingBag className="h-4 w-4" /> Historique des Transactions
               </h3>
               <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black tracking-widest text-primary italic">Activité Personnel</span>
               </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-16 bg-muted/10">
                    <th className="px-10 text-left">Date</th>
                    <th className="px-10 text-left">Localisation</th>
                    <th className="px-10 text-left">Volume</th>
                    <th className="px-10 text-right">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {myOrders?.map((order: Order) => (
                    <tr key={order.id} className="group hover:bg-primary/[0.02] transition-colors h-24">
                      <td className="px-10">
                        <p className="font-bold text-base tracking-tight">{format(new Date(order.created_at), "PP", { locale: fr })}</p>
                      </td>
                      <td className="px-10 text-muted-foreground font-medium italic">
                        {order.boutiques?.name || "Centrale"}
                      </td>
                      <td className="px-10 font-black text-primary/80">
                        {Number(order.total).toLocaleString()} FCFA
                      </td>
                      <td className="px-10 text-right">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                  {!myOrders?.length && (
                    <tr className="flex-1 min-h-[400px]">
                      <td colSpan={4} className="h-80 text-center">
                         <div className="flex flex-col items-center justify-center space-y-5 opacity-20">
                            <ShoppingBag className="h-16 w-16" />
                            <p className="text-lg font-black tracking-widest text-center italic">Aucune transaction répertoriée</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
