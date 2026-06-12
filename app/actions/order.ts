'use server';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createOrderSchema, confirmPaymentSchema } from '@/lib/validators/order';
import { sendEmail, buyerConfirmationHtml, sellerNotificationHtml } from '@/lib/email';

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

async function verifyPaystackTransaction(ref: string): Promise<{
  verified: boolean;
  amountInKobo: number;
  status: string;
  raw: Record<string, unknown>;
}> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY not configured');
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!res.ok) {
    throw new Error(`Paystack verification failed: ${res.status}`);
  }

  const json = await res.json();
  return {
    verified: json.data?.status === 'success',
    amountInKobo: json.data?.amount ?? 0,
    status: json.data?.status ?? '',
    raw: json,
  };
}

export async function confirmPayment(
  data: Record<string, unknown>,
): Promise<{ message: string; success?: boolean }> {
  const parsed = confirmPaymentSchema.safeParse(data);
  if (!parsed.success) {
    return { message: 'Invalid payment data.' };
  }

  const { productId, buyerName, buyerEmail, buyerPhone, deliveryAddress, quantity, paymentRef } = parsed.data;

  // Idempotency: skip if payment record already exists for this reference
  try {
    const existing = await db.payment.findUnique({
      where: { gatewayReference: paymentRef },
      select: { status: true },
    });
    if (existing?.status === 'completed') {
      return { message: '', success: true };
    }
  } catch (error) {
    logger.error('confirmPayment.idempotency', { error });
    return { message: 'Something went wrong. [E1]' };
  }

  // Lookup product
  let product: { name: string; price: number; userId: string | null; stockType: string; stockQuantity: number | null } | null;
  try {
    product = await db.product.findUnique({
      where: { id: productId },
      select: { name: true, price: true, userId: true, stockType: true, stockQuantity: true },
    });
  } catch (error) {
    logger.error('confirmPayment.productLookup', { error });
    return { message: 'Something went wrong. [E2]' };
  }
  if (!product) {
    return { message: 'Product not found.' };
  }

  const totalAmount = product.price * quantity;

  // Try to verify with Paystack — NEVER fail the order if verification is unavailable
  let paystackMetadata = '{}';
  try {
    const paystack = await verifyPaystackTransaction(paymentRef);
    if (paystack.verified && paystack.amountInKobo === totalAmount) {
      paystackMetadata = JSON.stringify({
        id: (paystack.raw.data as any)?.id,
        status: (paystack.raw.data as any)?.status,
        reference: (paystack.raw.data as any)?.reference,
        amount: (paystack.raw.data as any)?.amount,
        channel: (paystack.raw.data as any)?.channel,
        currency: (paystack.raw.data as any)?.currency,
        paidAt: (paystack.raw.data as any)?.paid_at,
        gatewayResponse: (paystack.raw.data as any)?.gateway_response,
        customer: (paystack.raw.data as any)?.customer
          ? { email: (paystack.raw.data as any).customer.email, id: (paystack.raw.data as any).customer.id }
          : null,
      });
    } else {
      logger.warn('confirmPayment.paystackIssue', { paymentRef, verified: paystack.verified, paystackAmount: paystack.amountInKobo, expectedAmount: totalAmount });
    }
  } catch (error) {
    logger.error('confirmPayment.verifySkipped', { error, paymentRef });
  }

  // Create paid order
  let order: { id: string };
  try {
    order = await db.order.create({
      data: {
        productId, userId: product.userId, buyerName, buyerEmail, buyerPhone, deliveryAddress,
        quantity, amount: totalAmount, status: 'paid',
      },
    });
  } catch (error) {
    logger.error('confirmPayment.createOrder', { error, productId, totalAmount, quantity });
    return { message: 'Something went wrong. [E3]' };
  }

  // Create payment record
  let payment: { id: string };
  try {
    payment = await db.payment.create({
      data: {
        orderId: order.id, gatewayReference: paymentRef, amount: totalAmount,
        currency: 'NGN', status: 'completed', metadata: paystackMetadata,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { message: '', success: true };
    }
    logger.error('confirmPayment.createPayment', { error, orderId: order.id, gatewayReference: paymentRef, totalAmount });
    try {
      await db.order.delete({ where: { id: order.id } });
    } catch (cleanupError) {
      logger.error('confirmPayment.cleanupOrder', { error: cleanupError });
    }
    return { message: 'Something went wrong. [E4]' };
  }

  try {
    await db.paymentLog.create({
      data: { paymentId: payment.id, event: 'completed', message: 'Payment completed successfully' },
    });
  } catch (error) {
    logger.error('confirmPayment.createPaymentLog', { error });
  }

  if (product.stockType === 'limited' && product.stockQuantity !== null) {
    try {
      await db.product.update({
        where: { id: productId, stockQuantity: { gte: quantity } },
        data: { stockQuantity: { decrement: quantity } },
      });
    } catch (stockError: any) {
      if (stockError.code === 'P2025') {
        logger.warn('order.stock.oversold', { productId, orderQuantity: quantity });
        return { message: '', success: true };
      }
      logger.error('confirmPayment.stockDecrement', { error: stockError });
      return { message: 'Something went wrong. [E5]' };
    }
  }

  // Send confirmation emails (fire-and-forget)
  (async () => {
    try {
      await sendEmail({
        to: buyerEmail,
        subject: 'Order confirmed!',
        html: buyerConfirmationHtml({
          buyerName,
          productName: product.name,
          quantity,
          amount: totalAmount,
          orderId: order.id,
        }),
      });
    } catch (e) {
      logger.error('confirmPayment.buyerEmail', { error: e });
    }
  })();

  if (product.userId) {
    (async () => {
      try {
        const seller = await db.user.findUnique({
          where: { id: product.userId! },
          select: { email: true, name: true },
        });
        if (seller?.email) {
          await sendEmail({
            to: seller.email,
            subject: `New order for ${product.name}`,
            html: sellerNotificationHtml({
              sellerName: seller.name || 'Seller',
              productName: product.name,
              buyerName,
              buyerEmail,
              buyerPhone,
              deliveryAddress,
              quantity,
              amount: totalAmount,
            }),
          });
        }
      } catch (e) {
        logger.error('confirmPayment.sellerEmail', { error: e });
      }
    })();
  }

  return { message: '', success: true };
}
