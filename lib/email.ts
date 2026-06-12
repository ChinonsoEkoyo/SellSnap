import { Resend } from 'resend';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const resend = new Resend(env.RESEND_API_KEY);

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(params: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      logger.error('email.send.failed', { error, to: params.to, subject: params.subject });
      return;
    }
    logger.info('email.send.success', { to: params.to, subject: params.subject, id: data?.id });
  } catch (error) {
    logger.error('email.send.error', { error, to: params.to, subject: params.subject });
  }
}

function formatNaira(amount: number): string {
  return (amount / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
}

export function buyerConfirmationHtml(params: {
  buyerName: string;
  productName: string;
  quantity: number;
  amount: number;
  orderId: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://sellsnap.com/images/SellSnapLogo.png" alt="SellSnap" height="32" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" valign="middle" style="width: 48px; height: 48px; background: #065f46; border-radius: 50%; font-size: 24px; line-height: 48px; color: #ffffff; font-family: 'Segoe UI Symbol', 'Arial Unicode MS', sans-serif;">&#10003;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 4px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">Order confirmed!</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Hi ${params.buyerName}, your order has been placed successfully.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">PRODUCT</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827; font-weight: 500;">${params.productName}</span></td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">QUANTITY</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827;">${params.quantity}</span></td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">TOTAL</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827; font-weight: 600;">${formatNaira(params.amount)}</span></td>
                </tr>
                <tr>
                  <td><span style="font-size: 12px; color: #9ca3af;">ORDER ID</span></td>
                  <td style="text-align: right;"><span style="font-size: 12px; color: #6b7280; font-family: monospace;">${params.orderId.slice(0, 8)}</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">The seller will reach out to you regarding delivery.</p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} SellSnap. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function sellerNotificationHtml(params: {
  sellerName: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  deliveryAddress: string | null;
  quantity: number;
  amount: number;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://sellsnap.com/images/SellSnapLogo.png" alt="SellSnap" height="32" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 4px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">New order received!</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Hi ${params.sellerName}, someone just placed an order for <strong>${params.productName}</strong>.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">BUYER</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827;">${params.buyerName}</span></td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">EMAIL</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827;">${params.buyerEmail}</span></td>
                </tr>
                ${params.buyerPhone ? `<tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">PHONE</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827;">${params.buyerPhone}</span></td>
                </tr>` : ''}
                ${params.deliveryAddress ? `<tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">DELIVERY</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827;">${params.deliveryAddress}</span></td>
                </tr>` : ''}
                <tr>
                  <td style="padding-bottom: 8px;"><span style="font-size: 12px; color: #9ca3af;">QUANTITY</span></td>
                  <td style="padding-bottom: 8px; text-align: right;"><span style="font-size: 14px; color: #111827;">${params.quantity}</span></td>
                </tr>
                <tr>
                  <td><span style="font-size: 12px; color: #9ca3af;">AMOUNT</span></td>
                  <td style="text-align: right;"><span style="font-size: 14px; color: #111827; font-weight: 600;">${formatNaira(params.amount)}</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center">
              <a href="${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/orders" style="display: inline-block; background: #1064FE; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 500;">View order</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} SellSnap. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeHtml(params: { name: string }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://sellsnap.com/images/SellSnapLogo.png" alt="SellSnap" height="32" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 4px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">Welcome to SellSnap!</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Hi ${params.name}, we&apos;re excited to have you on board.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
                SellSnap makes it easy to sell your products online. Share your product link and start receiving payments instantly.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background: #1064FE; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 500;">Go to dashboard</a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} SellSnap. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function passwordResetHtml(params: { name: string; resetLink: string }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://sellsnap.com/images/SellSnapLogo.png" alt="SellSnap" height="32" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 4px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Hi ${params.name}, we received a request to reset your password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
                Click the button below to set a new password. This link expires in 1 hour.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${params.resetLink}" style="display: inline-block; background: #1064FE; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 500;">Reset password</a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">If you didn&apos;t request this, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 8px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} SellSnap. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function productCreatedHtml(params: {
  name: string;
  productName: string;
  productPrice: number;
  productSlug: string;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="https://sellsnap.com/images/SellSnapLogo.png" alt="SellSnap" height="32" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 4px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">Product created!</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Hi ${params.name}, your product <strong>${params.productName}</strong> is now live.</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 8px; padding: 16px;">
                <tr>
                  <td><span style="font-size: 12px; color: #9ca3af;">PRODUCT</span></td>
                  <td style="text-align: right;"><span style="font-size: 14px; color: #111827; font-weight: 500;">${params.productName}</span></td>
                </tr>
                <tr>
                  <td style="padding-top: 8px;"><span style="font-size: 12px; color: #9ca3af;">PRICE</span></td>
                  <td style="padding-top: 8px; text-align: right;"><span style="font-size: 14px; color: #111827; font-weight: 600;">${formatNaira(params.productPrice)}</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${params.productSlug}" style="display: inline-block; background: #1064FE; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 500;">View product</a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} SellSnap. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
