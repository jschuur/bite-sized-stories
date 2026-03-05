import { NextRequest, NextResponse } from 'next/server';

import { getLanguages, getStoryRequirementCategories, getTopicIdeas } from '@/db/queries/settings';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true';

  let activeOnly = true;

  if (includeInactive) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user && isAdmin(session.user)) activeOnly = false;
  }

  const [languages, topicIdeas, storyRequirements] = await Promise.all([
    getLanguages(activeOnly),
    getTopicIdeas(),
    getStoryRequirementCategories(),
  ]);

  return NextResponse.json({ languages, topicIdeas, storyRequirements });
}
