import { NextResponse } from 'next/server';

import { deleteLanguage, getLanguageStoryCount, updateLanguage } from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const { id } = await params;
  const body = await req.json();

  const language = await updateLanguage(id, body);

  return NextResponse.json(language);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const { id } = await params;

  const storyCount = await getLanguageStoryCount(id);
  if (storyCount > 0)
    return NextResponse.json(
      { error: 'Cannot delete a language that has stories. Deactivate it instead.' },
      { status: 409 },
    );

  await deleteLanguage(id);

  return NextResponse.json({ success: true });
}
