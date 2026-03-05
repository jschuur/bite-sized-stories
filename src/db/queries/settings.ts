import { asc, count, eq } from 'drizzle-orm';

import { db } from '@/db';
import { languages, stories, storyRequirementCategories, topicIdeas } from '@/db/schema';

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// Types
export type Language = InferSelectModel<typeof languages>;
export type NewLanguage = InferInsertModel<typeof languages>;
export type TopicIdea = InferSelectModel<typeof topicIdeas>;
export type NewTopicIdea = InferInsertModel<typeof topicIdeas>;
export type StoryRequirementCategory = InferSelectModel<typeof storyRequirementCategories>;
export type NewStoryRequirementCategory = InferInsertModel<typeof storyRequirementCategories>;

// Languages
export async function getLanguages(activeOnly = false): Promise<Language[]> {
  const query = db.select().from(languages);

  if (activeOnly) return query.where(eq(languages.active, true)).orderBy(asc(languages.name));

  return query.orderBy(asc(languages.name));
}

export async function createLanguage(data: NewLanguage): Promise<Language> {
  const [lang] = await db.insert(languages).values(data).returning();

  return lang;
}

export async function updateLanguage(id: string, data: Partial<NewLanguage>): Promise<Language> {
  const [lang] = await db
    .update(languages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(languages.id, id))
    .returning();

  return lang;
}

export type LanguageWithStoryCount = Language & { storyCount: number };

export async function getLanguagesWithStoryCounts(): Promise<LanguageWithStoryCount[]> {
  const rows = await db
    .select({
      id: languages.id,
      name: languages.name,
      languageCode: languages.languageCode,
      googleCloudTts: languages.googleCloudTts,
      active: languages.active,
      createdAt: languages.createdAt,
      updatedAt: languages.updatedAt,
      storyCount: count(stories.id),
    })
    .from(languages)
    .leftJoin(stories, eq(languages.languageCode, stories.language))
    .groupBy(languages.id)
    .orderBy(asc(languages.name));

  return rows;
}

export async function getLanguageStoryCount(id: string): Promise<number> {
  const lang = await db.select({ languageCode: languages.languageCode }).from(languages).where(eq(languages.id, id));
  if (!lang[0]) return 0;

  const [result] = await db
    .select({ count: count(stories.id) })
    .from(stories)
    .where(eq(stories.language, lang[0].languageCode));

  return result?.count ?? 0;
}

export async function deleteLanguage(id: string): Promise<void> {
  await db.delete(languages).where(eq(languages.id, id));
}

// Topic Ideas
export type TopicIdeaWithStoryCount = TopicIdea & { storyCount: number };

export async function getTopicIdeasWithStoryCounts(): Promise<TopicIdeaWithStoryCount[]> {
  const rows = await db
    .select({
      id: topicIdeas.id,
      topic: topicIdeas.topic,
      createdAt: topicIdeas.createdAt,
      updatedAt: topicIdeas.updatedAt,
      storyCount: count(stories.id),
    })
    .from(topicIdeas)
    .leftJoin(stories, eq(topicIdeas.topic, stories.topic))
    .groupBy(topicIdeas.id)
    .orderBy(asc(topicIdeas.createdAt));

  return rows;
}

export async function getTopicIdeas(): Promise<TopicIdea[]> {
  return db.select().from(topicIdeas).orderBy(asc(topicIdeas.createdAt));
}

export async function createTopicIdea(data: NewTopicIdea): Promise<TopicIdea> {
  const [idea] = await db.insert(topicIdeas).values(data).returning();

  return idea;
}

export async function updateTopicIdea(id: string, data: Partial<NewTopicIdea>): Promise<TopicIdea> {
  const [idea] = await db
    .update(topicIdeas)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(topicIdeas.id, id))
    .returning();

  return idea;
}

export async function deleteTopicIdea(id: string): Promise<void> {
  await db.delete(topicIdeas).where(eq(topicIdeas.id, id));
}

// Story Requirement Categories
export async function getStoryRequirementCategories(): Promise<StoryRequirementCategory[]> {
  return db
    .select()
    .from(storyRequirementCategories)
    .orderBy(asc(storyRequirementCategories.key));
}

export async function createStoryRequirementCategory(
  data: NewStoryRequirementCategory
): Promise<StoryRequirementCategory> {
  const [cat] = await db.insert(storyRequirementCategories).values(data).returning();

  return cat;
}

export async function updateStoryRequirementCategory(
  id: string,
  data: Partial<NewStoryRequirementCategory>
): Promise<StoryRequirementCategory> {
  const [cat] = await db
    .update(storyRequirementCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(storyRequirementCategories.id, id))
    .returning();

  return cat;
}

export async function deleteStoryRequirementCategory(id: string): Promise<void> {
  await db.delete(storyRequirementCategories).where(eq(storyRequirementCategories.id, id));
}
