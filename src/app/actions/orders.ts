"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "@/lib/validations/order";
import { revalidatePath } from "next/cache";

export async function createOrderAction(formData: CreateOrderInput) {
  const supabase = await createClient();

  // 1. Validation du schéma
  const result = createOrderSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.format() };
  }

  const { items, ...orderData } = result.data;

  try {
    // 2. Création de la commande
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        ...orderData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Création des articles de commande
    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    revalidatePath("/dashboard/orders");
    return { success: true, orderId: order.id };
  } catch (err) {
    console.error("Order creation error:", err);
    return {
      error: "Une erreur est survenue lors de la création de la commande.",
    };
  }
}

export async function assignOrderHandlerAction(orderId: string, handlerId: string) {
  const supabase = await createClient();

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

  if (!profile || !["admin", "cashier"].includes(profile.role)) {
    return { error: "Action réservée au caissier ou à l'administrateur" };
  }

  const { data: targetUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", handlerId)
    .single();

  if (!targetUser || targetUser.role !== "employee") {
    return { error: "La commande doit être attribuée à un employé" };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("handler_id")
    .eq("id", orderId)
    .single();

  if (order?.handler_id) {
    return { error: "Cette commande est déjà attribuée" };
  }

  const { error } = await supabase
    .from("orders")
    .update({ handler_id: handlerId })
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/orders");
  return { success: true };
}
