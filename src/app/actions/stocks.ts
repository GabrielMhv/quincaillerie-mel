"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const StockTransferItemSchema = z.object({
  product_id: z.string().uuid("Product ID invalide"),
  quantity: z.number().int().min(1, "Quantité minimum: 1"),
});

const CreateStockTransferSchema = z.object({
  from_boutique_id: z.string().uuid("Boutique source invalide"),
  to_boutique_id: z.string().uuid("Boutique destination invalide"),
  items: z.array(StockTransferItemSchema).min(1, "Au moins 1 produit requis"),
});

type CreateStockTransferInput = z.infer<typeof CreateStockTransferSchema>;

/**
 * Initiate a stock transfer between boutiques (Manager only)
 */
export async function initiateStockTransfer(input: CreateStockTransferInput) {
  try {
    const validated = CreateStockTransferSchema.safeParse(input);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    // Get user role and boutique
    const { data: profile } = await supabase
      .from("users")
      .select("role, boutique_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { error: "Profil utilisateur non trouvé" };
    }

    // Verify permission: can only transfer FROM their own boutique
    if (
      profile.role !== "admin" &&
      profile.boutique_id !== validated.data.from_boutique_id
    ) {
      return {
        error:
          "Vous ne pouvez transférer que depuis votre propre boutique",
      };
    }

    // Verify boutiques are different
    if (validated.data.from_boutique_id === validated.data.to_boutique_id) {
      return { error: "La boutique source et destination doivent être différentes" };
    }

    // Check stock availability for all items
    const productIds = validated.data.items.map((item) => item.product_id);
    const { data: stocks } = await supabase
      .from("stocks")
      .select("product_id, quantity")
      .eq("boutique_id", validated.data.from_boutique_id)
      .in("product_id", productIds);

    for (const item of validated.data.items) {
      const stock = stocks?.find((s) => s.product_id === item.product_id);
      if (!stock || stock.quantity < item.quantity) {
        return {
          error: `Stock insuffisant pour le produit ${item.product_id}`,
        };
      }
    }

    // Create transfer record
    const { data: transfer, error: transferError } = await supabase
      .from("stock_transfers")
      .insert({
        from_boutique_id: validated.data.from_boutique_id,
        to_boutique_id: validated.data.to_boutique_id,
        status: "pending",
        created_by: user.id,
      })
      .select()
      .single();

    if (transferError || !transfer) {
      console.error("Error creating transfer:", transferError);
      return { error: "Erreur lors de la création du transfert" };
    }

    // Create transfer items
    const transferItems = validated.data.items.map((item) => ({
      transfer_id: transfer.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("stock_transfer_items")
      .insert(transferItems);

    if (itemsError) {
      console.error("Error creating transfer items:", itemsError);
      // Cleanup: delete transfer
      await supabase.from("stock_transfers").delete().eq("id", transfer.id);
      return { error: "Erreur lors de la création des articles du transfert" };
    }

    revalidatePath("/dashboard/stocks/transfers");
    return { success: true, data: transfer };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Approve a stock transfer (Manager of destination boutique only)
 */
export async function approveStockTransfer(transferId: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    // Get user role and boutique
    const { data: profile } = await supabase
      .from("users")
      .select("role, boutique_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { error: "Profil utilisateur non trouvé" };
    }

    // Get transfer details
    const { data: transfer } = await supabase
      .from("stock_transfers")
      .select("*")
      .eq("id", transferId)
      .single();

    if (!transfer) {
      return { error: "Transfert non trouvé" };
    }

    // Verify permission: can only approve transfers TO their own boutique
    if (
      profile.role !== "admin" &&
      profile.boutique_id !== transfer.to_boutique_id
    ) {
      return {
        error:
          "Vous ne pouvez approuver que les transferts vers votre propre boutique",
      };
    }

    // Update transfer status to accepted
    const { data: updatedTransfer, error } = await supabase
      .from("stock_transfers")
      .update({ status: "accepted" })
      .eq("id", transferId)
      .select()
      .single();

    if (error) {
      console.error("Error approving transfer:", error);
      return { error: "Erreur lors de l'approbation du transfert" };
    }

    revalidatePath("/dashboard/stocks/transfers");
    return { success: true, data: updatedTransfer };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Reject a stock transfer (Manager of destination boutique only)
 */
export async function rejectStockTransfer(
  transferId: string,
  reason?: string,
) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    // Get user role and boutique
    const { data: profile } = await supabase
      .from("users")
      .select("role, boutique_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { error: "Profil utilisateur non trouvé" };
    }

    // Get transfer details
    const { data: transfer } = await supabase
      .from("stock_transfers")
      .select("*")
      .eq("id", transferId)
      .single();

    if (!transfer) {
      return { error: "Transfert non trouvé" };
    }

    // Verify permission: can only reject transfers TO their own boutique
    if (
      profile.role !== "admin" &&
      profile.boutique_id !== transfer.to_boutique_id
    ) {
      return {
        error:
          "Vous ne pouvez rejeter que les transferts vers votre propre boutique",
      };
    }

    // Update transfer status to rejected
    const metadata = reason ? { rejection_reason: reason } : undefined;
    const { data: updatedTransfer, error } = await supabase
      .from("stock_transfers")
      .update({
        status: "rejected",
        metadata,
      })
      .eq("id", transferId)
      .select()
      .single();

    if (error) {
      console.error("Error rejecting transfer:", error);
      return { error: "Erreur lors du rejet du transfert" };
    }

    revalidatePath("/dashboard/stocks/transfers");
    return { success: true, data: updatedTransfer };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Complete a stock transfer (Admin or Manager who initiated)
 * Triggers automatic stock update via SQL trigger
 */
export async function completeStockTransfer(transferId: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    // Get user role
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { error: "Seuls les administrateurs peuvent finaliser les transferts" };
    }

    // Get transfer details
    const { data: transfer } = await supabase
      .from("stock_transfers")
      .select("*")
      .eq("id", transferId)
      .single();

    if (!transfer) {
      return { error: "Transfert non trouvé" };
    }

    // Verify transfer is in accepted state
    if (transfer.status !== "accepted") {
      return {
        error: "Le transfert doit être accepté avant d'être complété",
      };
    }

    // Update transfer status to completed
    // This will trigger the SQL trigger to update stocks
    const { data: updatedTransfer, error } = await supabase
      .from("stock_transfers")
      .update({ status: "completed" })
      .eq("id", transferId)
      .select()
      .single();

    if (error) {
      console.error("Error completing transfer:", error);
      return { error: "Erreur lors de la finalisation du transfert" };
    }

    revalidatePath("/dashboard/stocks/transfers");
    return { success: true, data: updatedTransfer };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Get pending transfers for a boutique (Manager or Admin)
 */
export async function getPendingTransfers(boutique_id: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Non authentifié" };
    }

    // Get pending transfers where this boutique is destination
    const { data: transfers, error } = await supabase
      .from("stock_transfers")
      .select(
        `
        *,
        stock_transfer_items(
          id,
          product_id,
          quantity,
          products(name, price)
        ),
        from_boutique:boutiques!from_boutique_id(name),
        to_boutique:boutiques!to_boutique_id(name),
        creator:users!created_by(name, avatar_url)
      `
      )
      .eq("to_boutique_id", boutique_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transfers:", error);
      return { error: "Erreur lors de la récupération des transferts" };
    }

    return { success: true, data: transfers };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}
