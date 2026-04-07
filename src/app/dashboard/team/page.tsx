import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { UserFormModal } from "@/components/team/user-form-modal";
import {
  Users,
  Shield,
  Sparkles,
  Mail,
  Building2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default async function DashboardTeamPage() {
  const supabase = await createClient();

  // Enforce role-based access
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="h-16 w-16 rounded-4xl bg-rose-500/10 flex items-center justify-center text-rose-600">
          <Shield className="h-8 w-8" />
        </div>
        <p className="text-xl font-black tracking-tighter italic">
          Périmètre Administrateur
        </p>
        <p className="text-sm text-muted-foreground font-medium">
          L&apos;accès à la gestion du personnel est restreint.
        </p>
      </div>
    );
  }

  // Fetch Boutiques
  const { data: boutiques } = await supabase
    .from("boutiques")
    .select("*")
    .order("name");

  // Fetch Users
  const { data: users, error } = await supabase
    .from("users")
    .select(
      `
      *,
      boutique:boutiques(name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) console.error("Users fetch error:", error);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <section className="flex flex-row items-center justify-between gap-6 px-10 py-12 rounded-[3.5rem] bg-violet-500/5 border border-violet-500/10 relative overflow-hidden group shadow-premium">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
          <Users className="h-40 w-40 text-violet-600" />
        </div>
        <div className="space-y-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 mb-2">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-1">
            Gestion de{" "}
            <span className="text-violet-500 italic">l&apos;Équipe</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-muted-foreground font-medium italic leading-none">
              Pilotez les accès et les affectations de vos collaborateurs
            </p>
          </div>
        </div>
        <div className="p-2 relative z-10">
          <UserFormModal boutiques={boutiques || []} />
        </div>
      </section>

      {/* Main List Area */}
      <section className="rounded-[4rem] border border-border/50 bg-card/80 backdrop-blur-xl shadow-premium overflow-hidden">
        <div className="p-10 border-b border-border/50 bg-muted/30 flex justify-between items-center">
          <h3 className="text-sm font-black tracking-tight text-muted-foreground/60 flex items-center gap-2">
            <Users className="h-4 w-4" /> Annuaire des Collaborateurs
          </h3>
          <div className="px-5 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-black tracking-widest text-primary italic">
              Structure Active
            </span>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] border-b border-border/30 h-16 bg-muted/10">
                <th className="px-10 text-left">Utilisateur</th>
                <th className="px-10 text-left">Contact & Mail</th>
                <th className="px-10 text-left">Rôle & Privilèges</th>
                <th className="px-10 text-left">Affectation</th>
                <th className="px-10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {users?.map((u) => (
                <tr
                  key={u.id}
                  className="group hover:bg-primary/2 transition-colors h-28"
                >
                  <td className="px-10">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-secondary/50 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 border-2 border-background shadow-sm overflow-hidden">
                        {u.avatar_url ? (
                          <Image
                            src={u.avatar_url}
                            alt={u.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircle className="h-8 w-8 opacity-40" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                          {u.name}{" "}
                          {u.id === user.id && (
                            <span className="text-xs font-medium text-primary/60 ml-1">
                              (Vous)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                      <Mail className="h-3.5 w-3.5 opacity-40" />
                      <span className="font-bold">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-10">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black tracking-widest border-2 transition-all duration-300",
                        u.role === "admin"
                          ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_-5px_var(--color-primary)]"
                          : u.role === "manager"
                            ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            : "bg-muted/50 text-muted-foreground border-border/50",
                      )}
                    >
                      {u.role === "admin"
                        ? "Administrateur"
                        : u.role === "manager"
                          ? "Manager"
                          : "Employé"}
                    </Badge>
                  </td>
                  <td className="px-10">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground/40" />
                      <span className="font-bold text-muted-foreground">
                        {u.boutique?.name || "Siège Social"}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                      <UserFormModal
                        boutiques={boutiques || []}
                        userToEdit={u}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr className="h-80">
                  <td colSpan={5} className="text-center">
                    <div className="flex flex-col items-center justify-center space-y-5 opacity-20">
                      <Users className="h-16 w-16" />
                      <p className="text-sm font-black tracking-widest italic opacity-40">
                        Aucun collaborateur trouvé
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
