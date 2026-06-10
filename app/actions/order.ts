'use server';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { verifyTransaction } from '@/lib/paystack';
import { createOrderSchema } from '@/lib/validators/order';

export type OrderFormState = {
  message: string;
  success?: boolean;
};

export async function createOrder(
  _previousState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const parsed = createOrderSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || 'Check your details.';
    return { message: firstError };
  }

  const { productId, buyerName, buyerEmail, buyerPhone, deliveryAddress, quantity } = parsed.data;

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { price: true, userId: true, stockType: true, stockQuantity: true },
    });

    if (!product) {
      return { message: 'Product not found.' };
    }

    if (product.stockType === 'limited' && product.stockQuantity !== null && quantity > product.stockQuantity) {
      return { message: 'Not enough stock available.' };
    }

    const totalAmount = product.price * quantity;

    await db.order.create({
      data: {
        productId,
        userId: product.userId,
        buyerName,
        buyerEmail,
        buyerPhone,
        deliveryAddress,
        quantity,
        amount: totalAmount,
        status: 'pending',
      },
    });

    return { message: '', success: true };
  } catch (error) {
    logger.error('order.create.failed', { error });
    return { message: 'Something went wrong. Please try again.' };
  }
}

export async function confirmPayment(data: {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  quantity: number;
  paymentRef: string;
}): Promise<{ message: string; success?: boolean }> {
  try {
    const verification = await verifyTransaction(data.paymentRef);

    if (!verification.status || verification.data?.status !== 'success') {
      logger.error('order.confirmPayment.verifyFailed', { ref: data.paymentRef, verification });
      return { message: 'Payment verification failed.' };
    }

    const product = await db.product.findUnique({
      where: { id: data.productId },
      select: { price: true, userId: true, stockType: true, stockQuantity: true },
    });

    if (!product) {
      return { message: 'Product not found.' };
    }

    if (product.stockType === 'limited' && product.stockQuantity !== null && data.quantity > product.stockQuantity) {
      return { message: 'Not enough stock available.' };
    }

    const totalAmount = product.price * data.quantity;

    if (verification.data.amount !== totalAmount) {
      logger.error('order.confirmPayment.amountMismatch', { expected: totalAmount, received: verification.data.amount });
      return { message: 'Payment amount mismatch.' };
    }

    await db.order.create({
      data: {
        productId: data.productId,
        userId: product.userId,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        deliveryAddress: data.deliveryAddress,
        quantity: data.quantity,
        amount: totalAmount,
        status: 'paid',
        payment: {
          create: {
            gatewayReference: data.paymentRef,
            amount: totalAmount,
            currency: 'NGN',
            status: 'completed',
          },
        },
      },
    });

    if (product.stockType === 'limited' && product.stockQuantity !== null) {
      await db.product.update({
        where: { id: data.productId },
        data: { stockQuantity: product.stockQuantity - data.quantity },
      });
    }

    return { message: '', success: true };
  } catch (error) {
    logger.error('order.confirmPayment.failed', { error });
    return { message: 'Something went wrong. Please try again.' };
  }
}
