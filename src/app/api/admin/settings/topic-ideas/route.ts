import { NextResponse } from 'next/server';

import { createTopicIdea, getTopicIdeasWithStoryCounts } from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const ideas = await getTopicIdeasWithStoryCounts();

  return NextResponse.json(ideas);
}

export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const body = await req.json();
  const { topic } = body;

  if (!topic)
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

  const idea = await createTopicIdea({ topic });

  return NextResponse.json(idea, { status: 201 });
}
