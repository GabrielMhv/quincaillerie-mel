"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Marquer une notification comme lue
 */
export async function markAsRead(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllAsRead(boutiqueId?: string | null) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé" };

  let query = supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (boutiqueId) {
    query = query.eq("boutique_id", boutiqueId);
  }

  const { error } = await query;

  if (error) return { error: error.message };

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

/**
 * Supprimer une notification
 */
export async function deleteNotification(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase.from("notifications").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/notifications");
  return { success: true };
}
