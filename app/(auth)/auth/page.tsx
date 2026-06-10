import { redirect } from 'next/navigation';

import { AuthForms } from '@/components/auth/AuthForms';
import { getSession } from '@/lib/auth';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AuthPage(props: { searchParams: SearchParams }) {
  const session = await getSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  const searchParams = await props.searchParams;
  const mode = searchParams?.mode === 'signup' ? 'signup' : 'login';

  return <AuthForms initialMode={mode} />;
}
