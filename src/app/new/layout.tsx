import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { canCreateStory } from '@/lib/permissions';

export default async function NewStoryLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!canCreateStory(session?.user)) redirect('/');

  return children;
}
