'use client';

import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPassword } from '@/app/actions/auth';

import styles from './Auth.module.css';

interface ResetPasswordFormProps {
  token: string;
  email: string;
}

export function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(resetPassword, { message: '' });
  const [errors, setErrors] = useState<{ password?: string }>({});

  if (state.success) {
    return (
      <div className={styles.form}>
        <p className={styles.successAlert}>
          Password reset successfully. You can now sign in with your new password.
        </p>
        <a href="/login" className={styles.link} style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
          Sign in
        </a>
      </div>
    );
  }

  return (
    <form className={styles.form} noValidate action={formAction}>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      <Input
        label="New Password"
        name="password"
        type="password"
        autoComplete="new-password"
        autoFocus
        required
        error={errors.password || state.message}
        onChange={() => setErrors((prev) => ({ ...prev, password: '' }))}
        onBlur={(e) => {
          if (e.target.value && e.target.value.length < 8) {
            setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
          }
        }}
      />
      <Button type="submit" fullWidth>
        Reset password
      </Button>
    </form>
  );
}
