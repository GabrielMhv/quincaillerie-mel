"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useBranding } from "@/components/providers/branding-provider";
import { cn } from "@/lib/utils";
import {
  Box,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  Building2,
  Tags,
  User,
  ArrowRightLeft,
  Plus,
  MessageSquare,
  Sparkles,
  ChevronRight,
  LogOut,
  ShieldCheck,
  DollarSign,
  Target,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading, signOut } = useAuth();
  const { settings } = useBranding();

  const boutiqueId = searchParams.get("boutiqueId");

  if (loading || !user) {
    return (
      <div className="flex h-full w-80 flex-col border-r border-primary/5 bg-card/40 p-10 pt-16">
        <div className="mb-12 h-12 w-3/4 animate-pulse rounded-2xl bg-primary/10" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse rounded-2xl bg-muted/20"
            />
          ))}
        </div>
      </div>
    );
  }

  // ... (rest of filtering logic)

  // Group Items by Logic
  const globalItems = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin"],
    },
    {
      title: "Analyses",
      href: "/dashboard/analyses",
      icon: TrendingUp,
      roles: ["admin"],
    },
    {
      title: "Comptabilité",
      href: "/dashboard/comptabilite",
      icon: DollarSign,
      roles: ["admin"],
    },
    {
      title: "Boutiques",
      href: "/dashboard/stores",
      icon: Building2,
      roles: ["admin"],
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      roles: ["admin"],
    },
    {
      title: "Commandes",
      href: "/dashboard/orders",
      icon: Package,
      roles: ["admin"],
    },
    {
      title: "Produits",
      href: "/dashboard/products",
      icon: Box,
      roles: ["admin"],
    },
    {
      title: "Gestion des Stocks",
      href: "/dashboard/stocks",
      icon: Store,
      roles: ["admin"],
    },
    {
      title: "Catégories",
      href: "/dashboard/categories",
      icon: Tags,
      roles: ["admin"],
    },
    {
      title: "Consulter les Transferts",
      href: "/dashboard/stocks/transfers",
      icon: ArrowRightLeft,
      roles: ["admin"],
    },
    {
      title: "Clients",
      href: "/dashboard/clients",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Équipe",
      href: "/dashboard/team",
      icon: ShieldCheck,
      roles: ["admin"],
    },
    {
      title: "Paramètres",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ].filter((item) => item.roles.includes(user.role));

  const boutiqueItems = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager"],
    },
    {
      title: "Analyses",
      href: "/dashboard/analyses",
      icon: TrendingUp,
      roles: ["admin", "manager"],
    },
    {
      title: "Comptabilité",
      href: "/dashboard/comptabilite",
      icon: DollarSign,
      roles: ["admin", "manager"],
    },
    {
      title: "Performances",
      href: "/dashboard/stats",
      icon: Target,
      roles: ["admin", "manager"],
    },
    {
      title: "Caisse",
      href: "/dashboard/pos",
      icon: ShoppingCart,
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Ventes",
      href: "/dashboard/orders",
      icon: Package,
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Produits",
      href: "/dashboard/products",
      icon: Box,
      roles: ["admin", "manager"],
    },
    {
      title: "Gestion des Stocks",
      href: "/dashboard/stocks",
      icon: Store,
      roles: ["admin", "manager"],
    },
    {
      title: "Réapprovisionnement",
      href: "/dashboard/stocks/request",
      icon: Plus,
      roles: ["admin", "manager"],
    },
    {
      title: "Journal des Transferts",
      href: "/dashboard/stocks/transfers",
      icon: ArrowRightLeft,
      roles: ["admin", "manager"],
    },
    {
      title: "Clients",
      href: "/dashboard/clients",
      icon: Users,
      roles: ["admin", "manager"],
    },
    {
      title: "Mon Profil",
      href: "/dashboard/profile",
      icon: User,
      roles: ["admin", "manager", "employee"],
    },
  ].filter((item) => item.roles.includes(user.role));

  const activeBoutiqueId = boutiqueId || user.boutique_id;

  return (
    <aside className="hidden w-80 lg:flex shrink-0 flex-col border-r border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl relative z-50 group/sidebar transition-all duration-700">
      {/* Dynamic light effects */}
      <div className="absolute top-0 left-0 w-full h-125 bg-linear-to-b from-primary/5 to-transparent pointer-events-none opacity-50" />
      <div className="absolute -left-20 top-40 w-40 h-40 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover/sidebar:translate-y-20 transition-transform duration-1000" />

      <div className="p-8 lg:p-10 relative">
        <Link
          href="/"
          className="flex items-center gap-4 group transition-all duration-500 hover:scale-105 active:scale-95"
        >
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3 group-hover:rotate-0 transition-all duration-500 border border-white/20">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              {settings.name}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-12 pb-10 custom-scrollbar relative">
        {/* User Card inside Sidebar */}
        <div className="p-5 rounded-3xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/5 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black tracking-tight truncate dark:text-white">
                {user.name}
              </span>
              <Badge
                variant="outline"
                className="w-fit text-[9px] font-black tracking-widest py-0 px-2 rounded-md bg-primary/10 text-primary border-none mt-1"
              >
                {user.role === "admin"
                  ? "Administrateur"
                  : user.role === "manager"
                    ? "Manager"
                    : "Employé"}
              </Badge>
            </div>
          </div>
        </div>
        {/* GLOBAL SECTION - Only for Admin */}
        {user.role === "admin" && (
          <div className="space-y-6">
            <div className="px-6 flex items-center justify-between group cursor-default">
              <h2 className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 italic">
                Réseau Global
              </h2>
              <Sparkles className="h-4 w-4 text-primary/30 group-hover:rotate-12 group-hover:scale-125 transition-all" />
            </div>
            <nav className="space-y-1.5 px-2">
              {globalItems.map((item) => {
                const isActive = pathname === item.href && !boutiqueId;
                return (
                  <Link
                    key={`global-${item.href}`}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl px-6 py-4 transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5 font-black scale-[1.02]"
                        : "text-slate-500 hover:bg-slate-900/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                          isActive
                            ? "text-primary dark:text-slate-900"
                            : "text-slate-400 group-hover:text-primary",
                        )}
                      />
                      <span className="text-sm font-bold tracking-tight">
                        {item.title}
                      </span>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-0 h-full w-1.5 bg-primary rounded-full transition-transform" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* BOUTIQUE SECTION */}
        <div className="space-y-6">
          <div className="px-6 flex items-center justify-between group cursor-default">
            <h2 className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 italic">
              {activeBoutiqueId
                ? user.role === "admin"
                  ? "Opérations Filiale"
                  : "Secteur Opérationnel"
                : "Navigation Restreinte"}
            </h2>
            <LayoutDashboard className="h-4 w-4 text-orange-500/30 group-hover:rotate-12 group-hover:scale-125 transition-all" />
          </div>
          {activeBoutiqueId ? (
            <nav className="space-y-1.5 px-2">
              {boutiqueItems.map((item) => {
                const isActive =
                  pathname === item.href &&
                  (boutiqueId || user.role !== "admin");
                const hrefWithBoutique = `${item.href}${item.href.includes("?") ? "&" : "?"}boutiqueId=${activeBoutiqueId}`;

                return (
                  <Link
                    key={`boutique-${item.href}`}
                    href={hrefWithBoutique}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl px-6 py-4 transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20 font-black scale-[1.02]"
                        : "text-slate-500 hover:bg-orange-500/5 hover:text-slate-900 dark:hover:text-white",
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                          isActive
                            ? "text-white"
                            : "text-orange-500/40 group-hover:text-orange-500",
                        )}
                      />
                      <span className="text-sm font-bold tracking-tight">
                        {item.title}
                      </span>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    )}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="mx-4 p-8 text-center rounded-[2.5rem] border border-dashed border-primary/10 bg-primary/5">
              <div className="h-10 w-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-primary/40" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed italic">
                Veuillez spécifier un point de vente pour activer les fonctions
                locales.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto p-6 space-y-4 border-t border-primary/5 bg-linear-to-t from-primary/2 to-transparent">
        {boutiqueId && (
          <div className="rounded-3xl bg-orange-600 shadow-lg shadow-orange-600/20 p-5 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 h-16 w-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-white" />
              <p className="text-[11px] font-black text-white tracking-widest italic lowercase">
                Haut Commandement Boutique
              </p>
            </div>
          </div>
        )}

        <div className="group rounded-[2.5rem] bg-card/60 backdrop-blur-md border border-primary/5 p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm transition-transform group-hover:rotate-6">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 italic">
                Signature
              </p>
              <p className="font-black text-base tracking-tighter truncate text-foreground/90 leading-tight mt-0.5">
                {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-primary/5 pt-4">
            <Badge
              variant="outline"
              className="rounded-full px-3 py-0.5 bg-primary/5 text-primary border-primary/10 text-[9px] font-black tracking-[0.2em] italic"
            >
              {user.role === "admin"
                ? "Administrateur"
                : user.role === "manager"
                  ? "Directeur"
                  : "Collaborateur"}
            </Badge>
            <button
              onClick={() => signOut()}
              className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all text-muted-foreground/40 hover:scale-110"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
