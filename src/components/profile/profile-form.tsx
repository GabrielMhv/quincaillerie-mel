"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Pencil,
  Key,
  Loader2,
  Camera,
  User,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { convertToWebP } from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

type ProfileInput = z.infer<typeof profileSchema>;

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
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.avatar_url || null,
  );
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: initialData.full_name,
      phone: initialData.phone || "",
      avatar_url: initialData.avatar_url || "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const webpBlob = await convertToWebP(file, 0.8);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const fileName = `${user.id}/${Date.now()}.webp`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, webpBlob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      setValue("avatar_url", publicUrl);
      setAvatarPreview(publicUrl);
      toast.success("Image chargée avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du chargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProfileInput) => {
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-2xl hover:bg-primary/5"
          >
            <Pencil className="h-4 w-4" /> Modifier le profil
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-3xl border-border/40 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <div className="bg-primary/10 p-8 pb-4 border-b border-primary/5">
          <DialogTitle className="text-3xl font-black tracking-tighter">
            Modifier mon <span className="text-primary italic">Profil</span>
          </DialogTitle>
          <DialogDescription className="font-medium">
            Mettez à jour vos informations personnelles.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="h-32 w-32 rounded-[2.5rem] bg-muted/30 border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden group-hover:border-primary/50 relative">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : avatarPreview ? (
                  <Avatar className="h-full w-full rounded-[2.2rem]">
                    <AvatarImage src={avatarPreview} className="object-cover" />
                    <AvatarFallback className="text-2xl font-black">
                      {initialData.full_name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-10 w-10 text-muted-foreground/40" />
                )}
                <label
                  htmlFor="avatar-upload-new"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                >
                  <Camera className="h-6 w-6" />
                </label>
              </div>
              <input
                id="avatar-upload-new"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
              Cliquez pour changer votre{" "}
              <span className="text-primary">photo de profil</span>
            </p>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="full_name"
                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"
              >
                <User className="h-3 w-3" /> Nom complet
              </Label>
              <Input
                id="full_name"
                {...register("full_name")}
                className="rounded-2xl border-none bg-primary/5 h-12 px-5 font-bold"
              />
              {errors.full_name && (
                <p className="text-[10px] text-destructive font-bold px-2">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"
              >
                <Phone className="h-3 w-3" /> Téléphone
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+229 00 00 00 00"
                className="rounded-2xl border-none bg-primary/5 h-12 px-5 font-bold"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-3xl h-14 font-black tracking-widest text-xs uppercase"
            disabled={isLoading || isUploading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-5 w-5" />
            )}
            Sauvegarder les modifications
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
            className="gap-2 text-muted-foreground hover:text-primary px-0"
          >
            <Key className="h-4 w-4" /> Changer le mot de passe
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-3xl border-border/40 rounded-[2.5rem] p-8 shadow-2xl">
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
