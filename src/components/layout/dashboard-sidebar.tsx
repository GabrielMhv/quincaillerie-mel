"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Box,
  LayoutDashboard,
  LucideIcon,
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
  Target,
  TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading, signOut } = useAuth();

  const boutiqueId = searchParams.get("boutiqueId");

  if (loading || !user) {
    return (
      <div className="flex h-full w-64 flex-col border-r border-primary/5 bg-card/40 p-6 pt-10">
        <div className="mb-10 h-10 w-3/4 animate-pulse rounded-2xl bg-primary/10" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded-2xl bg-muted/20"
            />
          ))}
        </div>
      </div>
    );
  }

  // Group Items by Logic
  const globalItems = [
    {
      title: "Tableau de bord",
      href: "/dashboard",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      title: "Analyses & Stats",
      href: "/dashboard/stats",
      icon: TrendingUp,
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
      title: "Catégories",
      href: "/dashboard/categories",
      icon: Tags,
      roles: ["admin"],
    },
    {
      title: "Transferts",
      href: "/dashboard/stocks/transfers",
      icon: ArrowRightLeft,
      roles: ["admin"],
    },
    { title: "Équipe", href: "/dashboard/team", icon: Users, roles: ["admin"] },
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
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "Performances",
      href: "/dashboard/stats",
      icon: TrendingUp,
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
      title: "Stocks",
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
      title: "Transferts",
      href: "/dashboard/stocks/transfers",
      icon: ArrowRightLeft,
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
    <aside className="hidden w-72 flex-col border-r border-primary/5 bg-card/30 backdrop-blur-2xl md:flex relative z-50">
      {/* Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="flex h-24 items-center px-8 relative">
        <Link href="/" className="flex items-center gap-3 group transition-all duration-500 hover:scale-105">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
             <span className="text-xl font-black tracking-tighter text-gradient leading-none">Championne</span>
             <span className="text-[10px] font-bold text-muted-foreground/40 tracking-[0.3em] ml-0.5">EST. 2024</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-6 px-4 space-y-10 custom-scrollbar relative">
        {/* GLOBAL SECTION - Only for Admin */}
        {user.role === "admin" && (
          <div className="space-y-4">
            <div className="px-6 flex items-center justify-between group cursor-default">
              <h2 className="text-[10px] font-black tracking-widest text-muted-foreground/40 italic lowercase">
                Intelligence Réseau
              </h2>
              <Sparkles className="h-3 w-3 text-primary/30 group-hover:scale-125 transition-transform" />
            </div>
            <nav className="space-y-1">
              {globalItems.map((item) => {
                const isActive = pathname === item.href && !boutiqueId;
                return (
                  <Link
                    key={`global-${item.href}`}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl px-6 py-3.5 transition-all duration-300",
                      isActive
                        ? "bg-primary shadow-lg shadow-primary/20 text-primary-foreground font-black"
                        : "text-muted-foreground/70 hover:bg-primary/5 hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-primary/40")} />
                      <span className="text-sm font-bold tracking-tight">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* BOUTIQUE SECTION */}
        <div className="space-y-4">
          <div className="px-6 flex items-center justify-between group cursor-default">
            <h2 className="text-[10px] font-black tracking-widest text-muted-foreground/40 italic lowercase">
              {activeBoutiqueId
                ? user.role === "admin" ? "Opérations Filiale" : "Environnement Local"
                : "Navigation Restreinte"}
            </h2>
            <LayoutDashboard className="h-3 w-3 text-orange-500/30 group-hover:scale-125 transition-transform" />
          </div>
          {activeBoutiqueId ? (
            <nav className="space-y-1">
              {boutiqueItems.map((item) => {
                const isActive = pathname === item.href && (boutiqueId || user.role !== "admin");
                const hrefWithBoutique = `${item.href}${item.href.includes("?") ? "&" : "?"}boutiqueId=${activeBoutiqueId}`;

                return (
                  <Link
                    key={`boutique-${item.href}`}
                    href={hrefWithBoutique}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl px-6 py-3.5 transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20 text-white font-black"
                        : "text-muted-foreground/70 hover:bg-orange-500/5 hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-orange-500/40")} />
                      <span className="text-sm font-bold tracking-tight">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
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
                  Veuillez spécifier un point de vente pour activer les fonctions locales.
                </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto p-6 space-y-4 border-t border-primary/5 bg-gradient-to-t from-primary/[0.02] to-transparent">
        {boutiqueId && (
          <div className="rounded-3xl bg-orange-600 shadow-lg shadow-orange-600/20 p-5 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 h-16 w-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center gap-3">
               <ShieldCheck className="h-5 w-5 text-white" />
               <p className="text-[11px] font-black text-white tracking-widest italic lowercase">Haut Commandement Boutique</p>
            </div>
          </div>
        )}
        
        <div className="group rounded-[2.5rem] bg-card/60 backdrop-blur-md border border-primary/5 p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm transition-transform group-hover:rotate-6">
                <User className="h-6 w-6" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-muted-foreground/40 tracking-widest italic lowercase truncate">Signature</p>
                <p className="font-black text-base tracking-tighter truncate text-foreground/90 leading-tight mt-0.5">{user.name}</p>
             </div>
          </div>
          <div className="flex items-center justify-between border-t border-primary/5 pt-4">
             <Badge variant="outline" className="rounded-full px-3 py-0.5 bg-primary/5 text-primary border-primary/10 text-[9px] font-black tracking-[0.2em] italic">
                {user.role === 'admin' ? 'Administrateur' : user.role === 'manager' ? 'Directeur' : 'Collaborateur'}
             </Badge>
             <button onClick={() => signOut()} className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-all text-muted-foreground/40 hover:scale-110">
                <LogOut className="h-4 w-4" />
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
