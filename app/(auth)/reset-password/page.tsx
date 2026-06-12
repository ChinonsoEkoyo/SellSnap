import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getSession } from '@/lib/auth';

import styles from '@/components/auth/Auth.module.css';

interface PageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const session = await getSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  const { token, email } = await searchParams;

  if (!token || !email) {
    redirect('/forgot-password');
  }

  return (
    <Card>
      <CardHeader>
        <p className={styles.eyebrow}>Reset password</p>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} email={email} />
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
