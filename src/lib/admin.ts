import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/permissions';

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !isAdmin(session.user))
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) };

  return { user: session.user };
}
