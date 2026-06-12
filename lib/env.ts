import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().startsWith('pk_'),
  PAYSTACK_SECRET_KEY: z.string().startsWith('sk_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.string().default('SellSnap <onboarding@resend.dev>'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
