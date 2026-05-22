"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use server-side proxy to perform auth (helps when direct requests fail)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error("Échec d'authentification", {
          description: body?.error || "L'email ou le mot de passe est invalide.",
        });
        setIsLoading(false);
        return;
      }

      const payload = await res.json().catch(() => ({}));

      // Continue to parse payload below; if the server returned tokens
      // we set the client session. Otherwise we'll fall back to server-set cookies.

      // If Supabase returned tokens, set session on client
      if (payload?.access_token && payload?.refresh_token) {
        try {
          // Guard against setSession hanging by using a timeout
          const setSessionPromise = supabase.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
          });

          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('setSession timeout')), 4000),
          );

          await Promise.race([setSessionPromise, timeout]);

          toast.success("Authentification réussie", {
            description: "Redirection vers votre console de gestion...",
          });
          try {
            router.push("/dashboard");
            router.refresh();
            // Fallback: force navigation if router doesn't move
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                window.location.href = '/dashboard';
              }
            }, 600);
          } catch (e) {
            if (typeof window !== 'undefined') window.location.href = '/dashboard';
          }

          setIsLoading(false);
          return;
        } catch (e) {
          // Even if setting session fails or times out, redirect because server may have set cookies
          try {
            router.push("/dashboard");
            router.refresh();
            setTimeout(() => {
              if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
                window.location.href = '/dashboard';
              }
            }, 600);
          } catch (err) {
            if (typeof window !== 'undefined') window.location.href = '/dashboard';
          }
          setIsLoading(false);
          return;
        }
      }

      // Some server setups only set HttpOnly cookies and do not return tokens
      // In that case treat a successful response as authenticated and redirect.
      try {
        toast.success("Authentification réussie", {
          description: "Redirection vers votre console de gestion...",
        });
        router.push("/dashboard");
        router.refresh();
        setIsLoading(false);
        return;
      } catch (e) {
        toast.error("Système indisponible");
        setIsLoading(false);
        return;
      }
    } catch (err) {
      toast.error("Système indisponible");
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-10 animate-in fade-in duration-700 delay-500"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label
            htmlFor="email"
            className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-300 ml-1"
          >
            Email professionnel
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="votre.nom@lachampionne.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
            className="h-16 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-visible:ring-primary/40 px-6 font-medium text-lg transition-all"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <Label
              htmlFor="password"
              className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-300"
            >
              Mot de passe
            </Label>
            <Button
              variant="link"
              className="p-0 h-auto text-[10px] font-bold text-primary hover:text-primary/70 no-underline"
              type="button"
            >
              Identifiants oubliés ?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="h-16 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-visible:ring-primary/40 px-6 font-medium text-lg transition-all"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-18 rounded-2xl text-[14px] font-black tracking-tight bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-3xl hover:scale-[1.02] active:scale-95 transition-all group"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Vérification en cours...
          </>
        ) : (
          <>
            Se connecter à la console
            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
          </>
        )}
      </Button>

      <div className="pt-8 border-t border-slate-200 dark:border-white/5 text-center">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Vous êtes un client ?{" "}
          <Link
            href="/"
            className="text-primary font-bold hover:underline underline-offset-4"
          >
            Retourner au site public
          </Link>
        </p>
      </div>
    </form>
  );
}
