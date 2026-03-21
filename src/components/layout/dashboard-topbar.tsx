"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, Moon, Sun, User, LayoutDashboard, Sparkles, Globe } from "lucide-react";
import { BoutiqueSwitcher } from "@/components/dashboard/boutique-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Suspense } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSearchParams } from "next/navigation";
import { useBoutique } from "@/components/providers/boutique-provider";
import { cn } from "@/lib/utils";

import { useBranding } from "@/components/providers/branding-provider";

export function DashboardTopbar() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings } = useBranding();
  const searchParams = useSearchParams();
  const boutiqueId = searchParams.get("boutiqueId");
  const { boutiques } = useBoutique();

  const currentBoutique = boutiqueId ? boutiques.find(b => b.id === boutiqueId) : null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);
  };

  const wrapHref = (href: string) => boutiqueId ? `${href}?boutiqueId=${boutiqueId}` : href;

  return (
    <header className="flex h-20 items-center gap-6 border-b border-primary/5 bg-background/60 backdrop-blur-xl px-4 lg:px-10 sticky top-0 z-40 transition-all duration-500">
      {/* Mobile Hamburger Menu (Sheet) */}
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="shrink-0 md:hidden h-12 w-12 rounded-2xl bg-muted/50 transition-transform active:scale-90" />}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col rounded-r-[3rem] border-primary/5 bg-card/95 backdrop-blur-2xl p-8">
          <SheetHeader className="pb-10 border-b border-primary/5">
             <SheetTitle className="text-3xl font-black tracking-tighter text-gradient text-left">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-4 mt-10">
            <Link
              href={wrapHref("/dashboard")}
              className="group flex items-center justify-between rounded-2xl px-6 py-4 bg-primary/5 text-primary font-bold transition-all hover:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                 <LayoutDashboard className="h-5 w-5" />
                 <span>Vue d&apos;ensemble</span>
              </div>
            </Link>
            <Link
              href={wrapHref("/dashboard/pos")}
              className="group flex items-center justify-between rounded-2xl px-6 py-4 text-muted-foreground hover:bg-muted font-bold transition-all"
            >
              <span>Caisse Digitale</span>
            </Link>
            <Link
              href={wrapHref("/dashboard/orders")}
              className="group flex items-center justify-between rounded-2xl px-6 py-4 text-muted-foreground hover:bg-muted font-bold transition-all"
            >
              <span>Registre Officiel</span>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1 flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="hidden text-2xl font-black tracking-tighter md:block leading-none group cursor-default">
            {currentBoutique ? (
              <span className="flex items-center gap-2">
                <span className="text-orange-500 opacity-60">#</span> {currentBoutique.name}
              </span>
            ) : (
              <span className="flex items-center gap-2 italic">
                {settings.name} <span className="text-gradient">Total</span>
              </span>
            )}
          </h1>
          <p className="hidden text-[10px] font-black tracking-widest text-muted-foreground/40 lg:block mt-1.5 lowercase italic">
            {currentBoutique ? "Unité Opérationnelle Locale" : settings.description}
          </p>
        </div>
        
        <div className="h-8 w-px bg-primary/5 hidden md:block mx-2" />

        {user?.role === "admin" && (
          <Suspense fallback={<div className="h-10 w-[200px] animate-pulse bg-muted rounded-2xl" />}>
            <div className="scale-95 group-hover:scale-100 transition-transform">
               <BoutiqueSwitcher />
            </div>
          </Suspense>
        )}
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-3 lg:gap-5">
        {user && (
          <div className="transition-transform hover:scale-110 active:scale-95">
             <NotificationBell userRole={user.role} boutiqueId={boutiqueId || user.boutique_id || undefined} />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 rounded-[1.2rem] bg-muted/30 border border-primary/5 hover:bg-primary/5 transition-all duration-500"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
          <span className="sr-only">Activer/Désactiver le thème</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-12 w-12 rounded-[1.3rem] p-0 overflow-hidden ring-primary/20 hover:ring-4 transition-all" />}>
            <Avatar className="h-full w-full rounded-none border border-primary/5">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-black text-xs">
                {user ? getInitials(user.name) : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 rounded-[2rem] p-4 border-primary/5 shadow-2xl backdrop-blur-xl bg-card/90" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-4 bg-muted/30 rounded-2xl border border-primary/5 mb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-black tracking-tight leading-none">{user?.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 italic mt-1">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-primary/5 my-3" />
            <DropdownMenuItem render={<Link href="/" className="rounded-xl h-11 flex items-center gap-3 font-bold" />}>
              <Globe className="h-4 w-4 opacity-40" /> Retour au site public
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/profile" className="rounded-xl h-11 flex items-center gap-3 font-bold" />}>
              <User className="h-4 w-4 opacity-40" /> Mon Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/5 my-3" />
            <DropdownMenuItem 
              onSelect={() => signOut()} 
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer w-full rounded-xl h-11 font-black tracking-tighter"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Se déconnecter de la session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
