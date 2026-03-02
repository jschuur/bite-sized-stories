import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { asc, count, countDistinct, gte, sql, sum } from 'drizzle-orm';

import { db } from '@/db';
import { stories, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !isAdmin(session.user))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days');

    const cutoffDate = days
      ? new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000)
      : null;

    const dateFilter = cutoffDate ? gte(stories.createdAt, cutoffDate) : undefined;

    const [storyCount, languageCount, userCount, tokenUsage, dailyStories, dailyTokens, usersList] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(stories)
          .where(dateFilter),

        db
          .select({ count: countDistinct(stories.language) })
          .from(stories)
          .where(dateFilter),

        db.select({ count: count() }).from(user),

        db
          .select({
            inputTokens: sum(stories.inputTokens),
            outputTokens: sum(stories.outputTokens),
          })
          .from(stories)
          .where(dateFilter),

        db
          .select({
            date: sql<string>`date(${stories.createdAt}, 'unixepoch')`.as('date'),
            count: count(),
          })
          .from(stories)
          .where(dateFilter)
          .groupBy(sql`date(${stories.createdAt}, 'unixepoch')`)
          .orderBy(sql`date(${stories.createdAt}, 'unixepoch')`),

        db
          .select({
            date: sql<string>`date(${stories.createdAt}, 'unixepoch')`.as('date'),
            inputTokens: sum(stories.inputTokens),
            outputTokens: sum(stories.outputTokens),
          })
          .from(stories)
          .where(dateFilter)
          .groupBy(sql`date(${stories.createdAt}, 'unixepoch')`)
          .orderBy(sql`date(${stories.createdAt}, 'unixepoch')`),

        db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            canCreateStory: user.canCreateStory,
            canCreateAudio: user.canCreateAudio,
            createdAt: user.createdAt,
          })
          .from(user)
          .orderBy(asc(user.createdAt)),
      ]);

    return NextResponse.json({
      cards: {
        stories: storyCount[0]?.count ?? 0,
        languages: languageCount[0]?.count ?? 0,
        users: userCount[0]?.count ?? 0,
        totalTokens:
          (Number(tokenUsage[0]?.inputTokens) || 0) +
          (Number(tokenUsage[0]?.outputTokens) || 0),
      },
      charts: {
        storiesByDay: dailyStories.map((row) => ({
          date: row.date,
          stories: row.count,
        })),
        tokensByDay: dailyTokens.map((row) => ({
          date: row.date,
          inputTokens: Number(row.inputTokens) || 0,
          outputTokens: Number(row.outputTokens) || 0,
        })),
      },
      users: usersList,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);

    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
