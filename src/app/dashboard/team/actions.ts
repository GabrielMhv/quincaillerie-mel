"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// This client uses the SERVICE_ROLE_KEY to bypass RLS and Auth restrictions
// Use ONLY in Server Actions or private API routes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createTeamMember(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const boutiqueId = formData.get("boutique_id") as string;

  try {
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name,
        role: role,
      }
    });

    if (authError) throw authError;

    // 2. Update the profile in the public.users table 
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from("users")
        .update({
          name: name,
          boutique_id: boutiqueId || null,
          role: role,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;
    }

    revalidatePath("/dashboard/team");
    return { success: true };
  } catch (error: any) {
    console.error("Admin user creation error:", error);
    return { error: error.message };
  }
}
