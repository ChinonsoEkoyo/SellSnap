import { testServerAction } from '@/app/actions/test';

export default async function TestPage() {
  const result = await testServerAction();
  return <pre>{JSON.stringify(result, null, 2)}</pre>;
}
