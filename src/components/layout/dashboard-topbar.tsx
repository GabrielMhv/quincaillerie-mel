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
import {
  Menu,
  LogOut,
  Moon,
  Sun,
  User,
  LayoutDashboard,
  Globe,
} from "lucide-react";
import { BoutiqueSwitcher } from "@/components/dashboard/boutique-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Suspense } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSearchParams } from "next/navigation";
import { useBoutique } from "@/components/providers/boutique-provider";

import { useBranding } from "@/components/providers/branding-provider";

export function DashboardTopbar() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings } = useBranding();
  const searchParams = useSearchParams();
  const boutiqueId = searchParams.get("boutiqueId");
  const { boutiques } = useBoutique();

  const currentBoutique = boutiqueId
    ? boutiques.find((b) => b.id === boutiqueId)
    : null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);
  };

  const wrapHref = (href: string) =>
    boutiqueId ? `${href}?boutiqueId=${boutiqueId}` : href;

  return (
    <header className="flex h-24 items-center gap-6 border-b border-primary/5 bg-background/60 backdrop-blur-2xl px-6 lg:px-12 sticky top-0 z-40 transition-all duration-500">
      {/* Mobile Hamburger Menu (Sheet) */}
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden h-12 w-12 rounded-2xl bg-muted/50 transition-transform active:scale-95 border border-primary/5 shadow-sm"
            />
          }
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Navigation</span>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex flex-col rounded-r-[3rem] border-primary/5 bg-card/95 backdrop-blur-2xl p-8"
        >
          <SheetHeader className="pb-10 border-b border-primary/5">
            <SheetTitle className="text-3xl font-black tracking-tighter text-gradient text-left">
              {settings.name}
            </SheetTitle>
          </SheetHeader>
          <nav className="grid gap-4 mt-10">
            <Link
              href={wrapHref("/dashboard")}
              className="group flex items-center justify-between rounded-2xl px-6 py-4 bg-primary/5 text-primary font-bold transition-all hover:bg-primary/10"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard Principal</span>
              </div>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1 flex items-center gap-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="hidden text-2xl lg:text-3xl font-black tracking-tighter sm:block leading-none group cursor-default">
              {currentBoutique ? (
                <span className="flex items-center gap-3 text-slate-900 dark:text-white drop-shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                  {currentBoutique.name}
                </span>
              ) : (
                <span className="flex items-center gap-2 italic text-primary dark:text-blue-400 font-black drop-shadow-sm">
                  {settings.name}
                </span>
              )}
            </h1>
          </div>
          <p className="hidden text-[11px] font-black tracking-[0.2em] text-muted-foreground/40 lg:block mt-2 lowercase italic">
            {currentBoutique
              ? "Unité de vente locale synchronisée"
              : "Poste de commandement centralisé"}
          </p>
        </div>

        <div className="h-10 w-px bg-primary/5 hidden md:block mx-4" />

        {user?.role === "admin" && (
          <Suspense
            fallback={
              <div className="h-12 w-64 animate-pulse bg-muted rounded-2xl" />
            }
          >
            <div className="scale-100 transition-all hover:scale-[1.02]">
              <BoutiqueSwitcher />
            </div>
          </Suspense>
        )}
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-3 lg:gap-5">
        {user && (
          <div className="transition-transform hover:scale-110 active:scale-95">
            <NotificationBell
              userRole={user.role}
              boutiqueId={boutiqueId || user.boutique_id || undefined}
            />
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
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-[1.3rem] p-0 overflow-hidden ring-primary/20 hover:ring-4 transition-all"
              />
            }
          >
            <Avatar className="h-full w-full rounded-none border border-primary/5">
              <AvatarFallback className="bg-linear-to-br from-primary/20 to-secondary/20 text-primary font-black text-xs">
                {user ? getInitials(user.name) : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-4xl p-4 border-primary/5 shadow-2xl backdrop-blur-xl bg-card/90"
            align="end"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal p-4 bg-muted/30 rounded-2xl border border-primary/5 mb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-black tracking-tight leading-none">
                    {user?.name}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground/60 italic mt-1">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-primary/5 my-3" />
            <DropdownMenuItem
              render={
                <Link
                  href="/"
                  className="rounded-xl h-11 flex items-center gap-3 font-bold"
                />
              }
            >
              <Globe className="h-4 w-4 opacity-40" /> Retour au site public
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <Link
                  href="/dashboard/profile"
                  className="rounded-xl h-11 flex items-center gap-3 font-bold"
                />
              }
            >
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
