import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import styles from './layout.module.css';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/auth');
  }

  const businessName = (session.user as unknown as { businessName?: string | null }).businessName;

  return (
    <div className={styles.container}>
      <Sidebar
        businessName={businessName}
        fullName={session.user.name}
      />
      <div className={styles.main}>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
