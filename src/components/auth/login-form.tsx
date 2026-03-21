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
import { cn } from "@/lib/utils";

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Échec d'authentification", {
          description: error.message === "Invalid login credentials" 
            ? "L'email ou le mot de passe est invalide." 
            : error.message
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Authentification réussie", {
          description: "Redirection vers votre console de gestion..."
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Système indisponible");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-10 animate-in fade-in duration-700 delay-500">
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-[11px] font-bold tracking-widest text-slate-400 ml-1">Email professionnel</Label>
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
            <Label htmlFor="password" className="text-[11px] font-bold tracking-widest text-slate-400">Mot de passe</Label>
            <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary hover:text-primary/70 no-underline" type="button">
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
        <p className="text-xs font-medium text-slate-500">
          Vous êtes un client ?{" "}
          <Link href="/" className="text-primary font-bold hover:underline underline-offset-4">
             Retourner au site public
          </Link>
        </p>
      </div>
    </form>
  );
}
