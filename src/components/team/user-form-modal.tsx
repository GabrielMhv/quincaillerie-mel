"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createTeamMember } from "@/app/dashboard/team/actions";

interface Boutique {
  id: string;
  name: string;
}

interface UserEditorProps {
  boutiques: Boutique[];
  userToEdit?: any;
}

export function UserFormModal({ boutiques, userToEdit }: UserEditorProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const boutique_id = formData.get("boutique_id") as string;

    try {
      if (!userToEdit) {
        // Mode Création : Utilise la Server Action (via Service Role)
        const result = await createTeamMember(formData);
        if (result.error) {
          if (result.error.includes("SERVICE_ROLE")) {
             throw new Error("Clé SERVICE_ROLE manquante dans .env.local");
          }
          throw new Error(result.error);
        }
        toast.success("Nouveau membre créé avec succès");
      } else {
        // Mode Modification : Utilise le client standard (RLS)
        const { error } = await supabase
          .from("users")
          .update({
            name,
            role,
            boutique_id: boutique_id || null,
          })
          .eq("id", userToEdit.id);

        if (error) throw error;
        toast.success("Profil mis à jour avec succès");
      }
      
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {userToEdit ? (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>Gérer</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="gap-2" />}>
          <Plus className="h-4 w-4" />
          Ajouter un membre
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{userToEdit ? "Modifier l'accès" : "Inviter un membre"}</DialogTitle>
          <DialogDescription>
             Attriibuez le rôle et la boutique d'affectation pour {userToEdit ? "ce membre" : "le nouvel employé"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom / Prénom</Label>
            <Input id="name" name="name" defaultValue={userToEdit?.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              name="email" 
              type="email" 
              defaultValue={userToEdit?.email} 
              disabled={!!userToEdit} 
              className={userToEdit ? "bg-muted" : ""} 
              required 
            />
            {userToEdit && (
              <p className="text-xs text-muted-foreground">L'email ne peut être modifié que par l'utilisateur.</p>
            )}
          </div>

          {!userToEdit && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe provisoire</Label>
              <Input id="password" name="password" type="password" placeholder="********" required />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <select
              id="role"
              name="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={userToEdit?.role || "employee"}
            >
              <option value="employee">Employé (Caisse)</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrateur Global</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boutique_id">Affectation (Boutique)</Label>
            <select
              id="boutique_id"
              name="boutique_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={userToEdit?.boutique_id || ""}
            >
              <option value="">Aucune affectation</option>
              {boutiques.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Indispensable pour limiter l'accès à une seule boutique.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {userToEdit ? "Sauvegarder les modifications" : "Créer le compte"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
