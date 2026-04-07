"use server";

import { createClient } from "@/lib/supabase/server";
import {
  productSchema,
  ProductInput,
  categorySchema,
  CategoryInput,
} from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

export async function createProduct(input: ProductInput) {
  const supabase = await createClient();

  // Validate input server-side
  const validated = productSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: validated.data.name,
      description: validated.data.description,
      price: validated.data.price,
      category_id: validated.data.category_id,
      image_url: validated.data.image_url,
    })
    .select()
    .single();

  if (productError) {
    console.error("Error creating product:", productError);
    return { error: "Erreur lors de la création du produit" };
  }

  // Handle initial stocks if provided
  if (validated.data.stocks && validated.data.stocks.length > 0) {
    const stocksToInsert = validated.data.stocks.map((s) => ({
      product_id: product.id,
      boutique_id: s.boutique_id,
      quantity: s.quantity,
    }));

    const { error: stockError } = await supabase
      .from("stocks")
      .insert(stocksToInsert);

    if (stockError) {
      console.error("Error creating stocks:", stockError);
      // We don't fail the whole operation but record it
    }
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/stocks");
  return { success: true, product };
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const supabase = await createClient();

  // Partial validation for updates
  const validated = productSchema.partial().safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from("products")
    .update(validated.data)
    .eq("id", id);

  if (error) {
    console.error("Error updating product:", error);
    return { error: "Erreur lors de la mise à jour du produit" };
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/stocks");
  return { success: true };
}

export async function createCategory(input: CategoryInput) {
  const supabase = await createClient();

  const validated = categorySchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase.from("categories").insert(validated.data);

  if (error) {
    console.error("Error creating category:", error);
    return { error: "Erreur lors de la création de la catégorie" };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
) {
  const supabase = await createClient();

  const validated = categorySchema.partial().safeParse(input);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { error } = await supabase
    .from("categories")
    .update(validated.data)
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    return { error: "Erreur lors de la mise à jour de la catégorie" };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  return { success: true };
}
