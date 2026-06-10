import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignupForm } from '@/components/auth/SignupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getSession } from '@/lib/auth';

import styles from '@/components/auth/Auth.module.css';

export default async function SignupPage() {
  const session = await getSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <Card>
      <CardHeader>
        <p className={styles.eyebrow}>Start selling</p>
        <CardTitle>Create your SellSnap account</CardTitle>
        <CardDescription>
          Open a lightweight seller workspace for shareable payment links.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <p className={styles.footer}>
          Already have an account?{' '}
          <Link className={styles.link} href="/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
