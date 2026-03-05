import { randomUUID } from 'crypto';

import { relations, sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { audioProviders } from '@/config';

import type { AudioProviderSettings, StoryRequirements } from '@/types';

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
  wordCount: integer('word_count'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
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

export const audios = sqliteTable('audios', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  language: text('language', { length: 50 }).notNull(),
  storyId: text('story_id').references(() => stories.id),
  provider: text('provider', { enum: audioProviders }).notNull(),
  // BUG: TablePlus (but not Drizzle Studio) crashes with 'The data couldn’t be read because it isn’t in the correct format.' error.
  settings: text('settings', { mode: 'json' }).$type<AudioProviderSettings>().notNull(),
  size: integer('size').notNull(),
  timeToGenerate: integer('generate_time').notNull(),
  filename: text('filename').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const audioSelectSchema = createSelectSchema(audios);
export const audioInsertSchema = createInsertSchema(audios);
export const audioUpdateSchema = createUpdateSchema(audios);

// Settings tables

export const languages = sqliteTable('languages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text('name').notNull(),
  languageCode: text('language_code').notNull().unique(),
  googleCloudTts: integer('google_cloud_tts', { mode: 'boolean' }).default(false).notNull(),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const languageSelectSchema = createSelectSchema(languages);
export const languageInsertSchema = createInsertSchema(languages);

export const topicIdeas = sqliteTable('topic_ideas', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  topic: text('topic').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const topicIdeaSelectSchema = createSelectSchema(topicIdeas);
export const topicIdeaInsertSchema = createInsertSchema(topicIdeas);

export const storyRequirementCategories = sqliteTable('story_requirement_categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  count: integer('count').notNull().default(1),
  template: text('template').notNull(),
  options: text('options', { mode: 'json' }).$type<(string | number)[]>().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const storyRequirementCategorySelectSchema = createSelectSchema(storyRequirementCategories);
export const storyRequirementCategoryInsertSchema = createInsertSchema(storyRequirementCategories);

export const storiesRelations = relations(stories, ({ many }) => ({
  audios: many(audios),
}));

export const audiosRelations = relations(audios, ({ one }) => ({
  story: one(stories, {
    fields: [audios.storyId],
    references: [stories.id],
  }),
}));

// Better Auth tables

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false).notNull(),
  canCreateStory: integer('can_create_story', { mode: 'boolean' }).default(false).notNull(),
  canCreateAudio: integer('can_create_audio', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
