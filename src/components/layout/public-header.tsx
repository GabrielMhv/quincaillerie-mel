"use client";

import Link from "next/link";
import {
  ShoppingCart,
  LogIn,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Store,
  MapPin,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useBoutique } from "@/components/providers/boutique-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useBranding } from "@/components/providers/branding-provider";

export function PublicHeader() {
  const { user, signOut, isAdmin, isManager, isEmployee } = useAuth();
  const { items } = useCartStore();
  const { resolvedTheme, setTheme } = useTheme();
  const { settings } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { boutiques, selectedBoutique, setSelectedBoutique, isLoading } =
    useBoutique();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const canAccessDashboard = isAdmin || isManager || isEmployee;

  return (
    <header className="sticky top-0 z-100 w-full border-b border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-2xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-4 lg:gap-10">
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 group"
          >
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
              <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <span className="font-black text-lg sm:text-2xl tracking-tighter text-gradient leading-none">
              {settings.name}
              <span className="hidden md:inline">
                <br />
                <span className="text-[10px] tracking-tight opacity-60 font-bold text-blue-400 inline-block">
                  {settings.description.substring(0, 30)}...
                </span>
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex gap-8">
            <Link
              href={
                selectedBoutique
                  ? `/products?boutiqueId=${selectedBoutique.id}`
                  : "/products"
              }
              className="text-sm font-bold tracking-tight opacity-70 hover:opacity-100 hover:text-primary transition-all flex items-center gap-1"
            >
              Catalogue
            </Link>
            <Link
              href="/about"
              className="text-sm font-bold tracking-tight opacity-70 hover:opacity-100 transition-all"
            >
              L&apos;histoire
            </Link>
            <Link
              href="/contact"
              className="text-sm font-bold tracking-tight opacity-70 hover:opacity-100 transition-all"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          {/* Boutique Selector - Desktop */}
          <div className="hidden xl:flex items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-1 rounded-3xl bg-secondary/80 dark:bg-card/80 border border-white/10 flex items-center gap-3 px-5 h-13 hover:bg-secondary transition-all cursor-pointer shadow-premium overflow-hidden">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                {isLoading ? (
                  <div className="h-4 w-30 animate-pulse bg-muted rounded" />
                ) : (
                  <Select
                    value={selectedBoutique?.id || ""}
                    onValueChange={(val) => {
                      const b = boutiques.find((bout) => bout.id === val);
                      if (b) {
                        setSelectedBoutique(b);
                        // If we are on products page, refresh with new boutiqueId
                        if (window.location.pathname === "/products") {
                          window.location.href = `/products?boutiqueId=${b.id}`;
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="border-none bg-transparent h-full p-0 shadow-none focus:ring-0 min-w-55 text-[13px] font-bold tracking-tight text-foreground/80 hover:text-foreground transition-colors pr-4">
                      <span className="truncate max-w-50 text-left ml-2">
                        {selectedBoutique?.name || "Boutique à proximité"}
                      </span>
                    </SelectTrigger>
                    <SelectContent
                      align="start"
                      sideOffset={24}
                      alignOffset={-40}
                      alignItemWithTrigger={false}
                      className="glass border-border/50 rounded-4xl p-3 shadow-2xl animate-in fade-in zoom-in duration-200 min-w-[320px]"
                    >
                      <div className="px-4 py-3 mb-2">
                        <p className="text-[10px] font-bold text-primary tracking-tight mb-1">
                          Nos points de vente
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Choisissez votre boutique de référence
                        </p>
                      </div>
                      {boutiques.map((b) => (
                        <SelectItem
                          key={b.id}
                          value={b.id}
                          className={cn(
                            "rounded-2xl text-[14px] font-bold tracking-tight my-1 p-3 focus:bg-primary/10 focus:text-primary transition-all border border-transparent",
                            selectedBoutique?.id === b.id &&
                              "bg-primary/5 border-primary/20 text-primary",
                          )}
                        >
                          <div className="flex items-center gap-3 py-1">
                            <MapPin
                              className={cn(
                                "h-4 w-4 shrink-0",
                                selectedBoutique?.id === b.id
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            />
                            <span className="truncate">{b.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 sm:h-11 sm:w-11 hover:bg-primary/10 text-primary transition-colors relative"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label="Changer de thème"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5 transition-all" />
              ) : (
                <Moon className="h-5 w-5 transition-all" />
              )}
            </Button>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full h-10 w-10 sm:h-11 sm:w-11 hover:bg-primary/10 group"
              >
                <ShoppingCart className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg shadow-primary/20 animate-in zoom-in">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="hidden md:flex items-center gap-4 border-l pl-6 border-white/10 ml-2">
              {user ? (
                <>
                  {canAccessDashboard && (
                    <Link href="/dashboard">
                      <Button
                        variant="default"
                        size="sm"
                        className="rounded-full px-8 h-12 font-bold tracking-tight text-[12px] shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                      >
                        Console
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2 rounded-full px-8 h-12 font-bold tracking-tight text-[12px] shadow-lg shadow-primary/20 group hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    Connexion
                  </Button>
                </Link>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full h-10 w-10 sm:h-11 sm:w-11 hover:bg-muted"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 top-20 z-50 h-[calc(100vh-80px)] w-full overflow-hidden transition-all duration-500 lg:hidden",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <div
          className="absolute inset-0 bg-indigo-950/40 backdrop-blur-3xl"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={cn(
            "relative z-20 h-full w-full max-w-sm sm:max-w-md ml-auto bg-background/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl p-6 sm:p-10 flex flex-col transition-transform duration-500 overflow-y-auto",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="space-y-12">
            <nav className="flex flex-col gap-6 text-2xl font-black tracking-tighter pt-4">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary transition-all"
              >
                Catalogue
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary transition-all"
              >
                L&apos;histoire
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-primary transition-all"
              >
                Contact
              </Link>
            </nav>

            <div className="pt-6 space-y-4">
              <h4 className="text-[10px] font-bold tracking-tight text-primary opacity-60">
                Points de vente
              </h4>
              <div className="flex flex-col gap-2">
                {boutiques.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBoutique(b);
                      setTimeout(() => setMobileMenuOpen(false), 200);
                    }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all border",
                      selectedBoutique?.id === b.id
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-secondary/40 border-transparent hover:bg-secondary/80 text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin
                        className={cn(
                          "h-5 w-5",
                          selectedBoutique?.id === b.id
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                      <p className="text-sm font-bold truncate">{b.name}</p>
                    </div>
                    {selectedBoutique?.id === b.id && (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 space-y-4">
              {user ? (
                <>
                  {canAccessDashboard && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full inline-block"
                    >
                      <Button className="w-full h-14 sm:h-16 rounded-[2.5rem] font-bold tracking-tight text-lg sm:text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                        Console de Gestion{" "}
                        <ChevronDown className="-rotate-90 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full h-14 sm:h-16 rounded-[2.5rem] font-bold text-rose-500 hover:bg-rose-500/10 text-sm sm:text-base"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Déconnexion du compte
                  </Button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-block"
                >
                  <Button className="w-full h-14 sm:h-16 rounded-[2.5rem] font-bold tracking-tight text-lg sm:text-xl shadow-xl shadow-primary/20">
                    Se connecter à l&apos;espace pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
