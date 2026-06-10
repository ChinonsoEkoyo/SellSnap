'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { signIn, signOut } from '@/lib/auth';
import { signupSchema } from '@/lib/validators/auth';
import { loginSchema } from '@/lib/validators/auth';

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

    await db.user.create({
      data: {
        name,
        businessName,
        email,
        password: hashedPassword,
      },
    });
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
