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
import { useState } from "react";
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
  const { theme, setTheme } = useTheme();
  const { settings } = useBranding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { boutiques, selectedBoutique, setSelectedBoutique, isLoading } =
    useBoutique();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const canAccessDashboard = isAdmin || isManager || isEmployee;

  return (
    <header className="sticky top-0 z-100 w-full border-b border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-2xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-gradient leading-none">
              {settings.name}
              <br />
              <span className="text-[10px] tracking-widest opacity-60 font-bold text-blue-400">
                {settings.description.substring(0, 30)}...
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
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">
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

          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-11 w-11 hover:bg-primary/10 text-primary transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full h-11 w-11 hover:bg-primary/10 group"
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
              className="md:hidden rounded-full h-11 w-11 hover:bg-muted"
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
          "fixed inset-0 top-20 z-50 h-[calc(100vh-80px)] w-full overflow-hidden transition-all duration-500 md:hidden",
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
            "relative z-20 h-full w-full max-w-112.5 ml-auto bg-card border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] p-8 sm:p-12 flex flex-col transition-transform duration-500 overflow-y-auto",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="space-y-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase opacity-60">
                Histoire & Expertise
              </h4>
              <nav className="flex flex-col gap-6 text-3xl font-black tracking-tighter">
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-all flex items-center justify-between group"
                >
                  <span>Catalogue</span>
                  <ChevronDown className="h-5 w-5 -rotate-90 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-all flex items-center justify-between group"
                >
                  <span>L&apos;histoire</span>
                  <ChevronDown className="h-5 w-5 -rotate-90 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-primary transition-all flex items-center justify-between group"
                >
                  <span>Contact</span>
                  <ChevronDown className="h-5 w-5 -rotate-90 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </Link>
              </nav>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase opacity-60">
                  Points de vente
                </h4>
                <div className="h-px flex-1 bg-border/20 ml-6" />
              </div>

              <div className="grid gap-4">
                {boutiques.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBoutique(b);
                      setTimeout(() => setMobileMenuOpen(false), 200);
                    }}
                    className={cn(
                      "relative w-full p-6 h-28 rounded-[2.5rem] text-left transition-all overflow-hidden flex flex-col justify-end group",
                      selectedBoutique?.id === b.id
                        ? "bg-primary text-white shadow-2xl shadow-primary/20 ring-4 ring-primary/10"
                        : "bg-secondary/40 hover:bg-secondary/80 border border-white/5",
                    )}
                  >
                    <div className="absolute top-6 right-6">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                          selectedBoutique?.id === b.id
                            ? "bg-white/20"
                            : "bg-primary/10 text-primary group-hover:scale-110",
                        )}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mb-1",
                          selectedBoutique?.id === b.id
                            ? "text-white/60"
                            : "text-muted-foreground opacity-50",
                        )}
                      >
                        Boutique{" "}
                        {b.name.includes("Ségbé") ? "Ségbé" : "Sanguera"}
                      </p>
                      <p className="text-xl font-black tracking-tighter truncate w-full pr-12">
                        {b.name}
                      </p>
                    </div>
                    {selectedBoutique?.id === b.id && (
                      <div className="absolute bottom-6 right-6">
                        <CheckCircle2 className="h-6 w-6 text-white animate-in zoom-in" />
                      </div>
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
                      <Button className="w-full h-18 rounded-[2.5rem] font-bold tracking-tight text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                        Console de Gestion{" "}
                        <ChevronDown className="-rotate-90 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full h-18 rounded-[2.5rem] font-bold text-rose-500 hover:bg-rose-500/10"
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
                  <Button className="w-full h-18 rounded-[2.5rem] font-bold tracking-tight text-xl shadow-xl shadow-primary/20">
                    Se connecter à l&apos;espace pro
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-6 pt-16">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tighter block leading-none">
                  {settings.name}
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-500">
                  {settings.address.split("•")[0].trim()}
                </span>
              </div>
            </div>
            <p className="text-[9px] font-medium tracking-tight opacity-20 max-w-50">
              © {new Date().getFullYear()} {settings.name}. Tous droits
              réservés. Digital Edition.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
