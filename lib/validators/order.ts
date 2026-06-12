import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.string().min(1),
  buyerName: z.string().min(1, 'Name is required'),
  buyerEmail: z.string().email('Valid email is required'),
  buyerPhone: z.string().min(1, 'Phone number is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  quantity: z.coerce.number().min(1).max(99).default(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

const paymentRefSchema = z.string().min(5, 'Invalid payment reference');

export const confirmPaymentSchema = createOrderSchema.extend({
  paymentRef: paymentRefSchema,
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
