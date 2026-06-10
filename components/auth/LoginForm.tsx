'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

import { loginUser, type AuthFormState } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import styles from './Auth.module.css';

const initialFormState: AuthFormState = {
  message: '',
};

function getEmailError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Field cannot be empty';
  const atIndex = trimmed.indexOf('@');
  if (atIndex < 1 || atIndex === trimmed.length - 1) return 'Enter a valid Email Address';
  return undefined;
}

function getPasswordError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Field cannot be empty';
  if (trimmed.length < 8) return 'Password must be at least 8 characters';
  return undefined;
}

export function LoginForm() {
  const router = useRouter();
  const [state, action] = useActionState(loginUser, initialFormState);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard');
    }
  }, [state.success, router]);

  return (
    <form
      action={action}
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        const form = e.currentTarget;
        const emailInput = form.querySelector<HTMLInputElement>('[name="email"]');
        const passwordInput = form.querySelector<HTMLInputElement>('[name="password"]');
        const emailError = getEmailError(emailInput?.value ?? '');
        const passwordError = getPasswordError(passwordInput?.value ?? '');
        setErrors({ email: emailError, password: passwordError });
        if (emailError || passwordError) {
          e.preventDefault();
        }
      }}
    >
      {state.message ? (
        <p className={styles.errorAlert} role="alert">
          {state.message}
        </p>
      ) : null}
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
      <Input
        label="Enter Password"
        labelEnd={<a href="/forgot-password" className={styles.forgotLink}>Forgot password?</a>}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
        onChange={(e) => setErrors((prev) => ({ ...prev, password: getPasswordError(e.target.value) }))}
        onBlur={(e) => setErrors((prev) => ({ ...prev, password: getPasswordError(e.target.value) }))}
      />
      <SubmitButton label="Sign in" />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" fullWidth isLoading={pending}>
      {label}
    </Button>
  );
}
