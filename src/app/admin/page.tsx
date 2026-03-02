import { headers } from 'next/headers';

import { auth } from '@/lib/auth';

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Admin</h1>
        <p className='text-muted-foreground'>
          Welcome, {session?.user?.name}. This is the admin dashboard.
        </p>
      </div>
    </div>
  );
}
