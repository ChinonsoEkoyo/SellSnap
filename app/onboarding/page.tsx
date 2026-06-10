import { redirect } from 'next/navigation';

import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { getSession } from '@/lib/auth';

import styles from './page.module.css';

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <OnboardingForm />
      </main>
    </div>
  );
}
