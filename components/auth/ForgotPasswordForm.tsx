'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { forgotPassword } from '@/app/actions/auth';

import styles from './Auth.module.css';

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, { message: '' });
  const [errors, setErrors] = useState<{ email?: string }>({});

  if (state.success) {
    return (
      <div className={styles.form}>
        <p className={styles.successAlert}>
          If an account with that email exists, we&apos;ve sent a reset link.
        </p>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      noValidate
      action={formAction}
    >
      <Input
        label="Enter Email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        error={errors.email || state.message}
        onChange={(e) => setErrors((prev) => ({ ...prev, email: '' }))}
        onBlur={(e) => {
          const trimmed = e.target.value.trim();
          if (!trimmed) {
            setErrors((prev) => ({ ...prev, email: 'Field cannot be empty' }));
          }
        }}
      />
      <Button type="submit" fullWidth>
        Send reset link
      </Button>
    </form>
  );
}
