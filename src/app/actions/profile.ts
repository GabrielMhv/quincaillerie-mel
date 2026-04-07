"use server";

import { createClient } from "@/lib/supabase/server";
import { userProfileSchema, UserProfileInput } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
export async function updateProfile(input: UserProfileInput) {
  const supabase = await createClient();

  const validated = userProfileSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Non autorisé" };
  }

  const { error } = await supabase
    .from("profiles")
    .update(validated.data)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { error: "Erreur lors de la mise à jour du profil" };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}

/**
 * Mise à jour du mot de passe (via Supabase Auth)
 */
export async function updatePassword(password: string) {
  const supabase = await createClient();

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("Error updating password:", error);
    return { error: "Erreur lors du changement de mot de passe" };
  }

  return { success: true };
}
