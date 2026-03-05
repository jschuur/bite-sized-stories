import { NextResponse } from 'next/server';

import { createLanguage, getLanguagesWithStoryCounts } from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const languages = await getLanguagesWithStoryCounts();

  return NextResponse.json(languages);
}

export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const body = await req.json();
  const { name, languageCode, googleCloudTts } = body;

  if (!name || !languageCode)
    return NextResponse.json({ error: 'Name and language code are required' }, { status: 400 });

  const language = await createLanguage({
    name,
    languageCode,
    googleCloudTts: googleCloudTts ?? false,
  });

  return NextResponse.json(language, { status: 201 });
}
