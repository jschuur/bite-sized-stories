import { NextRequest, NextResponse } from 'next/server';

import { getRecentStories, getStoriesPaginated } from '@/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paginated = searchParams.get('paginated');

    if (paginated === 'true') {
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '10');
      const sortBy = searchParams.get('sortBy') || 'updatedAt';
      const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
      const language = searchParams.get('language') || undefined;
      const difficulty = searchParams.get('difficulty') || undefined;
      const lengthRange = searchParams.get('lengthRange') || undefined;
      const createdWithinDays = searchParams.get('createdWithinDays')
        ? parseInt(searchParams.get('createdWithinDays')!)
        : undefined;

      const result = await getStoriesPaginated({
        page,
        pageSize,
        sortBy,
        sortOrder,
        language,
        difficulty,
        lengthRange,
        createdWithinDays,
      });

      return NextResponse.json(result);
    }

    const limit = parseInt(searchParams.get('limit') || '10');
    const stories = await getRecentStories(limit);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
