'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

import { registerUser, type AuthFormState } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import styles from './Auth.module.css';

const initialFormState: AuthFormState = {
  message: '',
};

function getRequiredError(value: string): string | undefined {
  return !value.trim() ? 'Field cannot be empty' : undefined;
}

function getNameError(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Field cannot be empty';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  return undefined;
}

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

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, action] = useActionState(registerUser, initialFormState);
  const [savedName, setSavedName] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    businessName?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (state.success) {
      router.push('/onboarding');
    }
  }, [state.success, router]);

  if (step === 1) {
    return (
      <form
        className={styles.form}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const nameInput = form.querySelector<HTMLInputElement>('[name="name"]');
          const emailInput = form.querySelector<HTMLInputElement>('[name="email"]');
          const nameError = getNameError(nameInput?.value ?? '');
          const emailError = getEmailError(emailInput?.value ?? '');
          setErrors({ name: nameError, email: emailError });
          if (!nameError && !emailError) {
            setSavedName(nameInput!.value);
            setSavedEmail(emailInput!.value);
            setStep(2);
          }
        }}
      >
        {state.message ? (
          <p className={styles.errorAlert} role="alert">
            {state.message}
          </p>
        ) : null}
        <Input
          label="Enter Full Name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          autoFocus
          required
          error={errors.name}
          onChange={(e) => setErrors((prev) => ({ ...prev, name: getNameError(e.target.value) }))}
          onBlur={(e) => setErrors((prev) => ({ ...prev, name: getNameError(e.target.value) }))}
        />
        <Input
          label="Enter Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={errors.email}
          onChange={(e) => setErrors((prev) => ({ ...prev, email: getEmailError(e.target.value) }))}
          onBlur={(e) => setErrors((prev) => ({ ...prev, email: getEmailError(e.target.value) }))}
        />
        <Button type="submit" fullWidth>
          Continue
        </Button>
      </form>
    );
  }

  return (
    <form
      action={action}
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        const form = e.currentTarget;
        const businessNameInput = form.querySelector<HTMLInputElement>('[name="businessName"]');
        const passwordInput = form.querySelector<HTMLInputElement>('[name="password"]');
        const businessNameError = getRequiredError(businessNameInput?.value ?? '');
        const passwordError = getPasswordError(passwordInput?.value ?? '');
        setErrors({ businessName: businessNameError, password: passwordError });
        if (businessNameError || passwordError) {
          e.preventDefault();
        }
      }}
    >
      {state.message ? (
        <p className={styles.errorAlert} role="alert">
          {state.message}
        </p>
      ) : null}
      <input type="hidden" name="name" value={savedName} />
      <input type="hidden" name="email" value={savedEmail} />
      <Input
        label="Enter Business Name"
        name="businessName"
        type="text"
        autoFocus
        required
        error={errors.businessName}
        onChange={(e) => setErrors((prev) => ({ ...prev, businessName: getRequiredError(e.target.value) }))}
        onBlur={(e) => setErrors((prev) => ({ ...prev, businessName: getRequiredError(e.target.value) }))}
      />
      <Input
        label="Enter Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        error={errors.password}
        onChange={(e) => setErrors((prev) => ({ ...prev, password: getPasswordError(e.target.value) }))}
        onBlur={(e) => setErrors((prev) => ({ ...prev, password: getPasswordError(e.target.value) }))}
      />
      <div className={styles.buttonRow}>
        <SubmitButton label="Create account" />
        <button type="button" className={styles.linkButton} onClick={() => setStep(1)}>
          Back
        </button>
      </div>
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
