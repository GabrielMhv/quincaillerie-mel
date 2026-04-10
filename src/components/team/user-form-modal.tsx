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
import {
  Loader2,
  Plus,
  UserPlus,
  Shield,
  Store,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createTeamMember } from "@/app/dashboard/team/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Boutique {
  id: string;
  name: string;
}

interface UserEditorProps {
  boutiques: Boutique[];
  userToEdit?: {
    id: string;
    name: string;
    email: string;
    role: string;
    boutique_id: string | null;
  };
}

export function UserFormModal({ boutiques, userToEdit }: UserEditorProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState(userToEdit?.role || "employee");
  const [boutiqueId, setBoutiqueId] = useState(
    userToEdit?.boutique_id || "none",
  );
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);
    formData.set("boutique_id", boutiqueId === "none" ? "" : boutiqueId);

    const name = formData.get("name") as string;

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
            boutique_id: boutiqueId === "none" ? null : boutiqueId,
          })
          .eq("id", userToEdit.id);

        if (error) throw error;
        toast.success("Profil mis à jour avec succès");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Erreur", {
        description:
          err instanceof Error
            ? err.message
            : "Une erreur inconnue est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {userToEdit ? (
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          Gérer
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="gap-2" />}>
          <Plus className="h-4 w-4" />
          Ajouter un membre
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl bg-card/95 backdrop-blur-xl">
        <div className="bg-primary/10 p-6 pb-2 border-b border-primary/10">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            {userToEdit ? "Modifier Profil" : "Nouveau Membre"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80 mt-1 font-medium italic">
            {userToEdit
              ? `Mise à jour des accès de ${userToEdit.name}`
              : "Créez un profil pour un nouvel employé ou manager."}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2"
              >
                <User className="h-3 w-3" /> Nom Complet
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={userToEdit?.name}
                placeholder="Ex: Jean Dupont"
                className="bg-primary/5 border-none focus-visible:ring-1 focus-visible:ring-primary h-11 px-4 rounded-xl font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2"
              >
                <Mail className="h-3 w-3" /> Email Pro
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={userToEdit?.email}
                placeholder="jean@exemple.com"
                disabled={!!userToEdit}
                className={cn(
                  "bg-primary/5 border-none focus-visible:ring-1 focus-visible:ring-primary h-11 px-4 rounded-xl font-bold",
                  userToEdit && "opacity-50 cursor-not-allowed",
                )}
                required
              />
            </div>
          </div>

          {!userToEdit && (
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2"
              >
                <Lock className="h-3 w-3" /> Mot de passe provisoire
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimal 6 caractères"
                className="bg-primary/5 border-none focus-visible:ring-1 focus-visible:ring-primary h-11 px-4 rounded-xl font-bold"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2">
                <Shield className="h-3 w-3" /> Rôle
              </Label>
              <Select
                value={role}
                onValueChange={(val) => setRole(val ?? "employee")}
              >
                <SelectTrigger className="bg-primary/5 border-none focus:ring-1 focus:ring-primary h-11 px-4 rounded-xl font-bold">
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent className="glass border-primary/20 rounded-2xl p-2 shadow-2xl">
                  <SelectItem value="employee" className="rounded-xl font-bold">
                    Employé (Caisse)
                  </SelectItem>
                  <SelectItem value="manager" className="rounded-xl font-bold">
                    Responsable Boutique
                  </SelectItem>
                  <SelectItem
                    value="admin"
                    className="rounded-xl font-bold text-red-500"
                  >
                    Administrateur Global
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 flex items-center gap-2">
                <Store className="h-3 w-3" /> Boutique
              </Label>
              <Select
                value={boutiqueId}
                onValueChange={(val) => setBoutiqueId(val ?? "none")}
              >
                <SelectTrigger className="bg-primary/5 border-none focus:ring-1 focus:ring-primary h-11 px-4 rounded-xl font-bold">
                  <SelectValue placeholder="Choisir une boutique" />
                </SelectTrigger>
                <SelectContent className="glass border-primary/20 rounded-2xl p-2 shadow-2xl">
                  <SelectItem value="none" className="rounded-xl font-bold">
                    Aucune (Si Admin)
                  </SelectItem>
                  {boutiques.map((b) => (
                    <SelectItem
                      key={b.id}
                      value={b.id}
                      className="rounded-xl font-bold"
                    >
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-primary/10">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-primary/20 hover:bg-primary/5 h-11 px-6 font-black tracking-widest text-[10px] uppercase"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary hover:bg-primary/90 h-11 px-8 font-black tracking-widest text-[10px] uppercase shadow-lg shadow-primary/20"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {userToEdit ? "Sauvegarder" : "Créer le compte"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
