import { randomUUID } from 'crypto';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import type { StoryRequirements } from '@/types';

export const stories = sqliteTable('stories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  language: text('language', { length: 50 }).notNull(),
  topic: text('topic', { length: 255 }).notNull(),
  difficultyLevel: text('difficulty_level', { length: 10 }).notNull(),
  storyRequirements: text('story_requirements', { mode: 'json' })
    .$type<StoryRequirements>()
    .notNull(),
  status: text('status', { length: 20, enum: ['pending', 'completed', 'error'] })
    .notNull()
    .default('pending'),
  title: text('title'),
  story: text('story'),
  prompt: text('prompt'),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const storySelectSchema = createSelectSchema(stories);
export const storyInsertSchema = createInsertSchema(stories);
export const storyUpdateSchema = createUpdateSchema(stories);
