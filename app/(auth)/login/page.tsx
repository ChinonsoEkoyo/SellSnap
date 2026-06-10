import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getSession } from '@/lib/auth';

import authStyles from '@/components/auth/Auth.module.css';

export default async function LoginPage() {
  const session = await getSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <Card>
      <CardHeader>
        <p className={authStyles.eyebrow}>Welcome back</p>
        <CardTitle>Sign in to SellSnap</CardTitle>
        <CardDescription>
          Manage products, orders, and your payment links.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className={authStyles.footer}>
          New to SellSnap?{' '}
          <Link className={authStyles.link} href="/signup">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
