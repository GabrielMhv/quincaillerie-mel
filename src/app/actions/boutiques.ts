"use server";

import { createClient } from "@/lib/supabase/server";
import { boutiqueSchema, BoutiqueInput } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

/**
 * Créer une nouvelle boutique (Admin only)
 */
export async function createBoutique(input: BoutiqueInput) {
  try {
    const supabase = await createClient();

    // Verify admin permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { error: "Seuls les administrateurs peuvent créer une boutique" };
    }

    const validated = boutiqueSchema.safeParse(input);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { data: boutique, error } = await supabase
      .from("boutiques")
      .insert({
        name: validated.data.name,
        address: validated.data.location,
        phone: validated.data.phone,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating boutique:", error);
      return { error: "Erreur lors de la création de la boutique" };
    }

    revalidatePath("/dashboard/stores");
    revalidatePath("/dashboard/products");
    return { success: true, data: boutique };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Mettre à jour une boutique existante (Admin only)
 */
export async function updateBoutique(
  id: string,
  input: Partial<BoutiqueInput>,
) {
  try {
    const supabase = await createClient();

    // Verify admin permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return {
        error: "Seuls les administrateurs peuvent modifier une boutique",
      };
    }

    const validated = boutiqueSchema.partial().safeParse(input);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const updateData: Record<string, string | boolean> = {};
    if (validated.data.name !== undefined)
      updateData.name = validated.data.name;
    if (validated.data.location !== undefined)
      updateData.address = validated.data.location;
    if (validated.data.phone !== undefined)
      updateData.phone = validated.data.phone;
    if (validated.data.is_active !== undefined)
      updateData.is_active = validated.data.is_active;

    const { data: boutique, error } = await supabase
      .from("boutiques")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating boutique:", error);
      return { error: "Erreur lors de la mise à jour de la boutique" };
    }

    revalidatePath("/dashboard/stores");
    revalidatePath("/dashboard/products");
    return { success: true, data: boutique };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Supprimer une boutique (Admin only)
 * Note: Cannot delete if it has active orders or stocks
 */
export async function deleteBoutique(id: string) {
  try {
    const supabase = await createClient();

    // Verify admin permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return {
        error: "Seuls les administrateurs peuvent supprimer une boutique",
      };
    }

    // Check if boutique has active orders
    const { count: orderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("boutique_id", id)
      .neq("status", "cancelled");

    if ((orderCount ?? 0) > 0) {
      return {
        error:
          "Impossible de supprimer une boutique avec des commandes actives",
      };
    }

    // Check if boutique has stocks
    const { count: stockCount } = await supabase
      .from("stocks")
      .select("*", { count: "exact", head: true })
      .eq("boutique_id", id)
      .gt("quantity", 0);

    if ((stockCount ?? 0) > 0) {
      return { error: "Impossible de supprimer une boutique avec des stocks" };
    }

    // Delete boutique
    const { error } = await supabase.from("boutiques").delete().eq("id", id);

    if (error) {
      console.error("Error deleting boutique:", error);
      return { error: "Erreur lors de la suppression de la boutique" };
    }

    revalidatePath("/dashboard/stores");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}
