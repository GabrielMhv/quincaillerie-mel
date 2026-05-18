import { createClient } from "@/lib/supabase/server";

/**
 * Exporte les données des commandes en format JSON (facilement transformable en CSV côté client)
 */
export async function exportOrders(boutiqueId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      client_name,
      phone,
      total,
      status,
      source,
      boutique:boutiques(name)
    `,
    )
    .order("created_at", { ascending: false });

  if (boutiqueId) {
    query = query.eq("boutique_id", boutiqueId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  return { data };
}

/**
 * Calcule la marge par produit (Simulation, nécessite un prix d'achat en DB)
 * Note: Pour implémenter cela réellement, il faudrait ajouter une colonne 'cost_price' dans la table products.
 */
export async function getProfitMargins() {
  const supabase = await createClient();

  // Simulation de calcul basée sur 30% de marge par défaut si le coût n'est pas renseigné
  const { data: products, error } = await supabase
    .from("products")
    .select("name, price");

  if (error) return { error: error.message };

  const analysis = products.map((p) => ({
    name: p.name,
    sell_price: p.price,
    estimated_margin: p.price * 0.3, // Marge théorique de 30%
    roi: "30%",
  }));

  return { data: analysis };
}
