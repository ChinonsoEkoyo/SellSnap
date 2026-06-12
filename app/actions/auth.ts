'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthError } from 'next-auth';

import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { signIn, signOut } from '@/lib/auth';
import { signupSchema, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validators/auth';
import { loginSchema } from '@/lib/validators/auth';
import { sendEmail, welcomeHtml, passwordResetHtml } from '@/lib/email';

export type AuthFormState = {
  message: string;
  success?: boolean;
};



export async function loginUser(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { message: 'Enter a valid email address and password.' };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: 'Email or password is incorrect.' };
    }

    logger.error('auth.login.failed', { error });
    return { message: 'Something went wrong. Please try again.' };
  }

  return { message: '', success: true };
}

export async function registerUser(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  let credentials: { email: string; password: string } | null = null;

  try {
    const rawData = Object.fromEntries(formData.entries());
    const result = signupSchema.safeParse(rawData);

    if (!result.success) {
      return { message: 'Check your details and try again.' };
    }

    const { name, businessName, email, password } = result.data;
    credentials = { email, password };

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { message: 'An account already exists for this email.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        businessName,
        email,
        password: hashedPassword,
      },
    });

    // Send welcome email (fire-and-forget)
    if (user.email) {
      sendEmail({
        to: user.email,
        subject: 'Welcome to SellSnap!',
        html: welcomeHtml({ name: user.name || 'there' }),
      });
    }
  } catch (error) {
    logger.error('auth.register.failed', { error });
    return { message: 'Something went wrong. Please try again.' };
  }

  if (!credentials) {
    return { message: 'Check your details and try again.' };
  }

  try {
    await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: 'Account created. Please sign in to continue.' };
    }

    logger.error('auth.register.signin.failed', { error });
    return { message: 'Something went wrong. Please try again.' };
  }

  return { message: '', success: true };
}

export async function logoutUser() {
  await signOut({ redirectTo: '/' });
}

export async function forgotPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: 'Enter a valid email address.' };
  }

  const { email } = parsed.data;

  // Always return success to avoid email enumeration
  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true } });
    if (!user) {
      return { message: '', success: true };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const resetLink = `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: 'Reset your SellSnap password',
      html: passwordResetHtml({ name: user.name || 'there', resetLink }),
    });
  } catch (error) {
    logger.error('auth.forgotPassword', { error });
  }

  return { message: '', success: true };
}

export async function resetPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { message: 'Password must be at least 8 characters.' };
  }

  const { token, password } = parsed.data;

  try {
    const record = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.expires < new Date()) {
      return { message: 'This reset link has expired or is invalid. Please request a new one.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { email: record.identifier },
      data: { password: hashedPassword },
    });

    await db.verificationToken.delete({
      where: { token },
    });
  } catch (error) {
    logger.error('auth.resetPassword', { error });
    return { message: 'Something went wrong. Please try again.' };
  }

  return { message: '', success: true };
}
