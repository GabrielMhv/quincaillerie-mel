"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userProfileSchema, UserProfileInput } from "@/lib/validations/product";
import { updateProfile, updatePassword } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Key, Loader2 } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    full_name: string;
    phone?: string | null;
    avatar_url?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      full_name: initialData.full_name,
      phone: initialData.phone || "",
      avatar_url: initialData.avatar_url || "",
    },
  });

  const onSubmit = async (data: UserProfileInput) => {
    setIsLoading(true);
    try {
      const result = await updateProfile(data);
      if (result.error) throw new Error(result.error);
      toast.success("Profil mis à jour");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2 rounded-2xl">
            <Pencil className="h-4 w-4" /> Modifier le profil
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/40 rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Modifier mon profil
          </DialogTitle>
          <DialogDescription>
            Mettez à jour vos informations personnelles.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              className="rounded-2xl border-border/40 bg-muted/30"
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              {...register("phone")}
              className="rounded-2xl border-border/40 bg-muted/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar_url">URL de l&apos;avatar</Label>
            <Input
              id="avatar_url"
              {...register("avatar_url")}
              className="rounded-2xl border-border/40 bg-muted/30"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-2xl h-12 font-bold"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PasswordChangeForm() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.error) throw new Error(result.error);
      toast.success("Mot de passe mis à jour");
      setOpen(false);
      setNewPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Key className="h-4 w-4" /> Changer le mot de passe
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/40 rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Sécurité
          </DialogTitle>
          <DialogDescription>
            Modifier votre mot de passe pour sécuriser votre compte.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordChange} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">Nouveau mot de passe</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-2xl border-border/40 bg-muted/30"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-2xl h-12 font-bold"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mettre à jour le mot de passe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
