import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(1, 'Price must be at least 1'),
  stockType: z.enum(['limited', 'unlimited']).default('unlimited'),
  stockQuantity: z.coerce.number().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
