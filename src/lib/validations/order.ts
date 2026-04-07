import { z } from "zod";

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  boutique_id: z.string().uuid().optional(),
});

export const createOrderSchema = z.object({
  client_name: z.string().min(2, "Nom trop court"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  total: z.number().nonnegative(),
  status: z
    .enum(["pending", "preparing", "completed", "cancelled"])
    .default("pending"),
  source: z.string().optional().nullable(),
  referred_employee_name: z.string().optional().nullable(),
  boutique_id: z.string().uuid(),
  is_scheduled: z.boolean().default(false),
  scheduled_at: z.string().optional().nullable(),
  items: z
    .array(orderItemSchema)
    .min(1, "La commande doit contenir au moins un article"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
