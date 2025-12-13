import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

import { stories } from '@/db/schema';

import { difficultyLevels, getRandomTopic, languages, storyRequirementsConfig } from '@/config';
import { env } from '@/env';

export type Story = InferSelectModel<typeof stories>;
export type CreateStory = InferInsertModel<typeof stories>;
export type UpdateStory = Partial<CreateStory>;

export type StoryStatus = Story['status'];

export type StoryRequirementOptions = {
  count: number;
  options: (string | number)[];
  template: string;
  label?: string;
};

export type StoryRequirementType = keyof typeof storyRequirementsConfig;
export type StoryRequirementValue = (string | number)[];
export type StoryRequirementsConfig = Record<StoryRequirementType, StoryRequirementOptions>;
export type StoryRequirements = Record<StoryRequirementType, (string | number)[]>;

export const storyRequestSchema = z.object({
  targetLanguage: z.enum(languages as [string, ...string[]], {
    message: 'Invalid target language',
  }),
  storyLength: z.coerce
    .number()
    .int()
    .min(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN)
    .max(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX)
    .transform((val) =>
      Math.max(
        env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN,
        Math.min(env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX, val)
      )
    ),
  difficultyLevel: z.enum(Object.keys(difficultyLevels) as [string, ...string[]], {
    message: 'Invalid difficulty level',
  }),
  topic: z.string().default(getRandomTopic()),
  includeVocabulary: z.coerce
    .boolean()
    .optional()
    .default(false)
    .transform((val) => (env.NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX ? false : val)),
  includeGrammarTips: z.coerce
    .boolean()
    .optional()
    .default(false)
    .transform((val) => (env.NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX ? false : val)),
});
export type StoryRequest = z.infer<typeof storyRequestSchema>;

// Usage tracking types
export type StoryUsage = {
  characters: number;
  tokens: number;
  requests: number;
  timestamp: number;
};

export type DailyUsage = {
  date: string; // YYYY-MM-DD format
  characters: number;
  tokens: number;
  requests: number;
};

export type SessionUsage = {
  characters: number;
  tokens: number;
  requests: number;
};

export type UsageStats = {
  currentStory: StoryUsage | null;
  session: SessionUsage;
  dailyHistory: DailyUsage[];
  totalAllTime: {
    characters: number;
    tokens: number;
    requests: number;
  };
};
