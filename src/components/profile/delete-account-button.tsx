"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteAccountButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      // 1. Delete the public profile (RLS allows only if id = auth.uid())
      const { error: profileError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (profileError) throw profileError;

      // 2. Sign out (This is as much as a client can do without admin API)
      await supabase.auth.signOut();

      toast.success("Votre compte a été supprimé.");
      router.push("/");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Deletion error:", error);
      toast.error("Erreur lors de la suppression du compte : " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" className="w-full gap-2">
            <Trash2 className="h-4 w-4" />
            Supprimer mon compte
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Êtes-vous absolument sûr ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Elle supprimera définitivement votre
            profil et vos données d&apos;accès de nos serveurs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Oui, supprimer mon compte"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
