import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { sendEmail, buyerConfirmationHtml, sellerNotificationHtml } from '@/lib/email';

export async function POST(request: Request) {
  const rawBody = await request.text();
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const signature = request.headers.get('x-paystack-signature');
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(rawBody)
    .digest('hex');
  if (hash !== signature) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (body.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }

  const paystackData = body.data;
  const reference = paystackData.reference;

  // Idempotency
  try {
    const existing = await db.payment.findUnique({
      where: { gatewayReference: reference },
      select: { status: true },
    });
    if (existing) {
      return NextResponse.json({ received: true });
    }
  } catch (error) {
    logger.error('webhook.step1.idempotency', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  const metadata = paystackData.metadata || {};
  const productId: string | undefined = metadata.productId;
  const buyerName: string | undefined = metadata.buyerName;
  const buyerEmail: string | undefined = paystackData.customer?.email;
  const buyerPhone: string | null = metadata.buyerPhone || null;
  const deliveryAddress: string | null = metadata.deliveryAddress || null;
  const quantity: number = metadata.quantity || 1;

  if (!productId || !buyerEmail || !buyerName) {
    return NextResponse.json({ error: 'Missing required metadata' }, { status: 400 });
  }

  let product: { name: string; price: number; userId: string | null; stockType: string; stockQuantity: number | null } | null;
  try {
    product = await db.product.findUnique({
      where: { id: productId },
      select: { name: true, price: true, userId: true, stockType: true, stockQuantity: true },
    });
  } catch (error) {
    logger.error('webhook.step2.productLookup', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const totalAmount = product.price * quantity;

  if (paystackData.amount !== totalAmount) {
    logger.error('webhook.amountMismatch', { reference, paystackAmount: paystackData.amount, totalAmount });
  }

  // Create paid order
  let order: { id: string };
  try {
    order = await db.order.create({
      data: {
        productId,
        userId: product.userId,
        buyerName,
        buyerEmail,
        buyerPhone,
        deliveryAddress,
        quantity,
        amount: totalAmount,
        status: 'paid',
      },
    });
  } catch (error) {
    logger.error('webhook.createOrder', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // Create payment record
  let payment: { id: string };
  try {
    payment = await db.payment.create({
      data: {
        orderId: order.id,
        gatewayReference: reference,
        amount: totalAmount,
        currency: paystackData.currency || 'NGN',
        status: 'completed',
        metadata: JSON.stringify({ event: body.event, id: paystackData.id, reference }),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ received: true });
    }
    logger.error('webhook.createPayment', { error: String(error) });
    try {
      await db.order.delete({ where: { id: order.id } });
    } catch (deleteError) {
      logger.error('webhook.deleteOrphanOrder', { error: String(deleteError) });
    }
    return NextResponse.json({ received: true });
  }

  try {
    await db.paymentLog.create({
      data: { paymentId: payment.id, event: 'completed', message: 'Payment completed via webhook' },
    });
  } catch (error) {
    logger.error('webhook.createPaymentLog', { error: String(error) });
  }

  // Decrement stock
  if (product.stockType === 'limited' && product.stockQuantity !== null) {
    try {
      await db.product.update({
        where: { id: productId, stockQuantity: { gte: quantity } },
        data: { stockQuantity: { decrement: quantity } },
      });
    } catch (stockError: any) {
      if (stockError.code === 'P2025') {
        return NextResponse.json({ received: true });
      }
      logger.error('webhook.step6.stockDecrement', { error: String(stockError) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // Send confirmation emails (fire-and-forget)
  Promise.resolve().then(async () => {
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
      logger.error('webhook.buyerEmail', { error: e });
    }
  });

  if (product.userId) {
    Promise.resolve().then(async () => {
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
        logger.error('webhook.sellerEmail', { error: e });
      }
    });
  }

  return NextResponse.json({ received: true });
}
