'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import styles from './Auth.module.css';

function getEmailError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Field cannot be empty';
  const atIndex = trimmed.indexOf('@');
  if (atIndex < 1 || atIndex === trimmed.length - 1) return 'Enter a valid Email Address';
  return undefined;
}

export function ForgotPasswordForm() {
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [sent, setSent] = useState(false);

  if (sent) {
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
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const emailInput = form.querySelector<HTMLInputElement>('[name="email"]');
        const emailError = getEmailError(emailInput?.value ?? '');
        setErrors({ email: emailError });
        if (!emailError) {
          setSent(true);
        }
      }}
    >
      <Input
        label="Enter Email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        required
        error={errors.email}
        onChange={(e) => setErrors((prev) => ({ ...prev, email: getEmailError(e.target.value) }))}
        onBlur={(e) => setErrors((prev) => ({ ...prev, email: getEmailError(e.target.value) }))}
      />
      <Button type="submit" fullWidth>
        Send reset link
      </Button>
    </form>
  );
}
