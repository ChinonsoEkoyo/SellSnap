import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getSession } from '@/lib/auth';

import styles from '@/components/auth/Auth.module.css';

export default async function ForgotPasswordPage() {
  const session = await getSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <Card>
      <CardHeader>
        <p className={styles.eyebrow}>Reset password</p>
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <p className={styles.footer}>
          Remember your password?{' '}
          <Link className={styles.link} href="/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
