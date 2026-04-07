"use server";

import { createClient } from "@/lib/supabase/server";
import { boutiqueSchema, BoutiqueInput } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

/**
 * Créer une nouvelle boutique
 */
export async function createBoutique(input: BoutiqueInput) {
  const supabase = await createClient();

  const validated = boutiqueSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase.from("boutiques").insert(validated.data);

  if (error) {
    console.error("Error creating boutique:", error);
    return { error: "Erreur lors de la création de la boutique" };
  }

  revalidatePath("/dashboard/stores");
  revalidatePath("/dashboard/products");
  return { success: true };
}

/**
 * Mettre à jour une boutique existante
 */
export async function updateBoutique(
  id: string,
  input: Partial<BoutiqueInput>,
) {
  const supabase = await createClient();

  const validated = boutiqueSchema.partial().safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from("boutiques")
    .update(validated.data)
    .eq("id", id);

  if (error) {
    console.error("Error updating boutique:", error);
    return { error: "Erreur lors de la mise à jour de la boutique" };
  }

  revalidatePath("/dashboard/stores");
  revalidatePath("/dashboard/products");
  return { success: true };
}

/**
 * Supprimer une boutique (avec précaution car liée aux stocks)
 */
export async function deleteBoutique(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("boutiques").delete().eq("id", id);

  if (error) {
    console.error("Error deleting boutique:", error);
    return {
      error:
        "Impossible de supprimer la boutique (vérifiez s'il y a des stocks ou commandes liés)",
    };
  }

  revalidatePath("/dashboard/stores");
  return { success: true };
}
