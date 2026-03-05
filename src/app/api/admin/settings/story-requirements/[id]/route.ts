import { NextResponse } from 'next/server';

import {
  deleteStoryRequirementCategory,
  updateStoryRequirementCategory,
} from '@/db/queries/settings';
import { requireAdmin } from '@/lib/admin';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const { id } = await params;
  const body = await req.json();

  const category = await updateStoryRequirementCategory(id, body);

  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin();
  if ('error' in adminCheck) return adminCheck.error;

  const { id } = await params;
  await deleteStoryRequirementCategory(id);

  return NextResponse.json({ success: true });
}
