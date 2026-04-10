"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertCircle } from "lucide-react";

export function DeleteAccountButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // In a real app, you might want to call a server action to handle cleanup
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Compte supprimé avec succès");
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl gap-3 h-12 px-5 font-bold"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Button>
        }
      />
      <AlertDialogContent className="rounded-[2.5rem] bg-card/95 backdrop-blur-3xl border-destructive/20 max-w-sm">
        <AlertDialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <AlertDialogTitle className="text-2xl font-black tracking-tighter">
            Supprimer le compte ?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-medium">
            Cette action est irréversible. Toutes vos données seront
            définitivement effacées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8">
          <AlertDialogCancel className="rounded-2xl h-12 font-bold border-none bg-muted/50">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="rounded-2xl h-12 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
