import { z } from "zod";

export const productStockSchema = z.object({
  boutique_id: z.string().uuid("Boutique invalide"),
  quantity: z.number().int().min(0, "La quantité ne peut pas être négative"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Le prix doit être supérieur à 0"),
  category_id: z.string().uuid("Catégorie invalide"),
  image_url: z
    .string()
    .url("L'image doit être une URL valide")
    .optional()
    .nullable(),
  stocks: z.array(productStockSchema).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const boutiqueSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom de la boutique doit contenir au moins 2 caractères"),
  location: z.string().min(2, "La localisation est requise"),
  phone: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type BoutiqueInput = z.infer<typeof boutiqueSchema>;

export const userProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Le nom complet doit contenir au moins 2 caractères"),
  phone: z.string().optional().nullable(),
  avatar_url: z
    .string()
    .url("L'avatar doit être une URL valide")
    .optional()
    .nullable(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
