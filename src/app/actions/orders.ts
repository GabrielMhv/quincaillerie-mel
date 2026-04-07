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
