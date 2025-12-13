import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { stories } from '@/db/schema';

import type { CreateStory, Story, UpdateStory } from '@/types';

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
