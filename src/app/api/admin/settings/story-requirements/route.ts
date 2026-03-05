import { NextResponse } from 'next/server';

import {
  createStoryRequirementCategory,
  getStoryRequirementCategories,
} from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const categories = await getStoryRequirementCategories();

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const body = await req.json();
  const { key, label, count, template, options } = body;

  if (!key || !label || !template || !options)
    return NextResponse.json(
      { error: 'Key, label, template, and options are required' },
      { status: 400 }
    );

  const category = await createStoryRequirementCategory({
    key,
    label,
    count: count ?? 1,
    template,
    options,
  });

  return NextResponse.json(category, { status: 201 });
}
