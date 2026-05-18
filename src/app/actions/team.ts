"use client";

import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

// Schemas
const userUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "Nom trop court"),
  role: z.enum(["admin", "manager", "employee"]),
  boutique_id: z.string().uuid().nullable(),
});

/**
 * Update a team member's role or boutique assignment
 * Admin only
 */
export async function updateTeamMember(data: z.infer<typeof userUpdateSchema>) {
  const supabase = createClient();

  // Verify admin requester
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();
  if (!requester) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", requester.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Action réservée aux administrateurs");
  }

  const validated = userUpdateSchema.parse(data);

  const { error } = await supabase
    .from("users")
    .update({
      name: validated.name,
      role: validated.role,
      boutique_id: validated.boutique_id,
    })
    .eq("id", validated.id);

  if (error) throw new Error(`Erreur update: ${error.message}`);

  revalidatePath("/dashboard/team");
  return { success: true };
}

/**
 * Delete (deactivate) a team member
 * Note: In Supabase, you might want to call an edge function
 * if you want to truly delete from auth.users
 */
export async function deleteTeamMember(userId: string) {
  const supabase = createClient();

  // Admin check
  const {
    data: { user: requester },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", requester?.id || "")
    .single();

  if (profile?.role !== "admin") throw new Error("Accès refusé");

  // Soft delete or restrict access
  const { error } = await supabase
    .from("users")
    .update({ role: "client", boutique_id: null }) // Downgrade to client as soft-delete
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/team");
  return { success: true };
}
