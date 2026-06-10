'use client';

import { useState } from 'react';

import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

import styles from './Auth.module.css';

interface AuthFormsProps {
  initialMode?: 'login' | 'signup';
}

export function AuthForms({ initialMode = 'login' }: AuthFormsProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  return (
    <Card>
      <CardHeader>
        <p className={styles.eyebrow}>
          {mode === 'login' ? 'Welcome back' : 'Start selling'}
        </p>
        <CardTitle>
          {mode === 'login' ? 'Sign in to SellSnap' : 'Create your SellSnap account'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Manage products, orders, and your payment links.'
            : 'Open a lightweight seller workspace for shareable payment links.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === 'login' ? <LoginForm /> : <SignupForm />}
        <p className={styles.footer}>
          {mode === 'login' ? (
            <>
              New to SellSnap?{' '}
              <button
                className={styles.linkButton}
                onClick={() => setMode('signup')}
                type="button"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className={styles.linkButton}
                onClick={() => setMode('login')}
                type="button"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
