import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

import {
  audioProviders,
  difficultyLevels,
  storyRequirementsConfig,
} from '@/config';
import { audios, stories } from '@/db/schema';
import { env } from '@/env';

export type SupportedLanguage = {
  languageCode: string;
  name: string;
  googleCloudTts: boolean;
};
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
  targetLanguage: z.string().min(1, { message: 'Target language is required' }),
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
  topic: z.string().default(''),
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

export type Audio = InferSelectModel<typeof audios>;
export type CreateAudio = InferInsertModel<typeof audios>;
export type UpdateAudio = Partial<CreateAudio>;

export type AudioProvider = (typeof audioProviders)[number];

export type AudioProviderSettings = {
  voice: string;
  model: string;
  prompt: string;
};

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  canCreateStory: boolean;
  canCreateAudio: boolean;
  createdAt: string;
};

export type DashboardStats = {
  cards: {
    stories: number;
    languages: number;
    users: number;
    totalTokens: number;
  };
  charts: {
    storiesByDay: { date: string; stories: number }[];
    tokensByDay: { date: string; inputTokens: number; outputTokens: number }[];
  };
  users: DashboardUser[];
};
