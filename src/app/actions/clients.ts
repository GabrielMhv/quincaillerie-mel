"use client";

import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

const clientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nom requis"),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

/**
 * Update client information manually
 */
export async function upsertClient(data: z.infer<typeof clientSchema>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth required");

  const validated = clientSchema.parse(data);

  // Note: Local business logic uses the 'users' table with role 'client'
  // or a dedicated 'clients' table if specified in schema.
  // Based on project_summary, we use users table for everyone.

  const { error } = await supabase.from("users").upsert({
    ...(validated.id ? { id: validated.id } : {}),
    name: validated.name,
    phone: validated.phone,
    address: validated.address,
    email: validated.email || null,
    role: "client",
  });

  if (error) throw error;

  revalidatePath("/dashboard/clients");
  return { success: true };
}
