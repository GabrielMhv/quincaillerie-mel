import Link from "next/link";
import { MoveLeft, Ghost, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Ghost className="h-24 w-24 text-primary animate-bounce" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 w-16 bg-black/10 rounded-full blur-sm" />
          </div>
        </div>

        <p className="text-base font-semibold text-primary uppercase tracking-widest">
          Erreur 404
        </p>

        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-6xl uppercase italic">
          Page Introuvable
        </h1>

        <p className="mt-6 text-lg leading-7 text-muted-foreground max-w-lg mx-auto font-medium">
          Désolé, nous n&apos;avons pas pu trouver la page que vous recherchez.
          Il semble que ce lien soit brisé ou que la page ait été déplacée.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button
              size="lg"
              className="rounded-full px-8 h-14 text-lg font-bold flex items-center gap-2"
            >
              <Home className="h-5 w-5" />
              Retour à l&apos;accueil
            </Button>
          </Link>

          <Link href="javascript:history.back()">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-14 text-lg font-bold border-2 flex items-center gap-2"
            >
              <MoveLeft className="h-5 w-5" />
              Page précédente
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto border-t border-border pt-12">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Produits
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Explorez notre catalogue complet de quincaillerie.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
            >
              Voir les produits &rarr;
            </Link>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Contact
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Besoin d&apos;aide ? Notre équipe est là pour vous répondre.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
            >
              Nous contacter &rarr;
            </Link>
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Dashboard
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Accédez à vos outils de gestion de boutique.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
            >
              Espace gestion &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
