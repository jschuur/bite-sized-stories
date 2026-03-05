import { and, asc, count, desc, eq, gte, lte, or, SQL } from 'drizzle-orm';

import { db } from '@/db';
import { audios, stories } from '@/db/schema';

import type { Audio, CreateAudio, CreateStory, Story, UpdateStory } from '@/types';

export async function createStory(params: CreateStory): Promise<Story> {
  const [story] = await db
    .insert(stories)
    .values({ status: 'pending', ...params })
    .returning();

  return story;
}

export async function updateStory(params: UpdateStory): Promise<void> {
  if (!params.id) throw new Error('Story ID is required for updatingStory');

  await db
    .update(stories)
    .set({
      updatedAt: new Date(),
      ...params,
    })
    .where(eq(stories.id, params.id));
}

export async function getStoryById(id: string): Promise<Story | null> {
  const res = await db.select().from(stories).where(eq(stories.id, id)).limit(1);

  return res.length > 0 ? res[0] : null;
}

export async function getLastStory(): Promise<Story | null> {
  const res = await db.select().from(stories).orderBy(desc(stories.createdAt)).limit(1);

  return res.length > 0 ? res[0] : null;
}

export async function getRecentStories(limit: number = 10): Promise<Story[]> {
  return await db.select().from(stories).orderBy(desc(stories.createdAt)).limit(limit);
}

export type StoriesQueryParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  language?: string;
  difficulty?: string;
  lengthRange?: string;
  createdWithinDays?: number;
};

function getSortOrder(sortBy: string, sortOrder: 'asc' | 'desc'): SQL {
  const dir = sortOrder === 'asc' ? asc : desc;
  switch (sortBy) {
    case 'title': return dir(stories.title);
    case 'language': return dir(stories.language);
    case 'difficultyLevel': return dir(stories.difficultyLevel);
    case 'wordCount': return dir(stories.wordCount);
    case 'updatedAt': return dir(stories.updatedAt);
    case 'createdAt':
    default:
      return dir(stories.createdAt);
  }
}

export async function getStoriesPaginated(params: StoriesQueryParams = {}): Promise<{
  stories: Story[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    language,
    difficulty,
    lengthRange,
    createdWithinDays,
  } = params;

  const conditions: SQL[] = [];

  if (language) conditions.push(eq(stories.language, language));
  if (difficulty) conditions.push(eq(stories.difficultyLevel, difficulty));

  if (createdWithinDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - createdWithinDays);
    cutoffDate.setHours(0, 0, 0, 0);
    conditions.push(gte(stories.createdAt, cutoffDate));
  }

  if (lengthRange) {
    const ranges = lengthRange.split(',');
    const wordCountConditions: SQL[] = [];

    for (const range of ranges) {
      switch (range) {
        case 'short':
          wordCountConditions.push(and(gte(stories.wordCount, 0), lte(stories.wordCount, 200))!);
          break;
        case 'medium':
          wordCountConditions.push(and(gte(stories.wordCount, 201), lte(stories.wordCount, 500))!);
          break;
        case 'long':
          wordCountConditions.push(gte(stories.wordCount, 501));
          break;
      }
    }

    if (wordCountConditions.length === 1) {
      conditions.push(wordCountConditions[0]);
    } else if (wordCountConditions.length > 1) {
      conditions.push(or(...wordCountConditions)!);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderDirection = getSortOrder(sortBy, sortOrder);

  const offset = (page - 1) * pageSize;

  const [storyRows, totalResult] = await Promise.all([
    db
      .select()
      .from(stories)
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: count() })
      .from(stories)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    stories: storyRows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createAudio(params: CreateAudio): Promise<Audio> {
  const [audio] = await db.insert(audios).values(params).returning();

  return audio;
}
