import { createEnv } from '@t3-oss/env-nextjs';
import { boolean } from 'boolean';
import { z } from 'zod';

import {
  defaultAnthropicModel,
  defaultAnthropicUsageUrl,
  defaultDifficultyLevel,
  defaultStoryLength,
  defaultStoryLengthMax,
  defaultStoryLengthMin,
  defaultTargetLanguage,
} from '@/config';

export const env = createEnv({
  server: {
    ANTHROPIC_API_KEY: z.string().min(1),
    ANTHROPIC_MODEL: z.string().min(4).default(defaultAnthropicModel),
    SITE_HOSTNAME: z.string().optional(),
    DATABASE_URL: z.string().min(1).default('file:./db/local.db'),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
    GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
    GOOGLE_AUTH_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLOUD_PROJECT_ID: z.string().optional(),
    GOOGLE_CLOUD_PRIVATE_KEY: z.string().optional(),
    GOOGLE_CLOUD_CLIENT_EMAIL: z.string().optional(),
    DEBUG: z
      .string()
      .transform((val) => boolean(val))
      .optional()
      .default(false),
  },
  client: {
    NEXT_PUBLIC_DEBUG: z
      .string()
      .transform((val) => boolean(val))
      .optional()
      .default(false),
    NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE: z.string().min(1).default(defaultTargetLanguage),
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH: z.coerce.number().default(defaultStoryLength),
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN: z.coerce.number().default(defaultStoryLengthMin),
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX: z.coerce.number().default(defaultStoryLengthMax),
    NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL: z.string().min(1).default(defaultDifficultyLevel),
    NEXT_PUBLIC_DEFAULT_TOPIC: z.string().optional(),
    NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY: z.preprocess((val) => {
      if (val === undefined || val === '') return false;
      return boolean(val as string);
    }, z.boolean().default(false)),
    NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR: z.preprocess((val) => {
      if (val === undefined || val === '') return false;
      return boolean(val as string);
    }, z.boolean().default(false)),
    NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX: z.preprocess((val) => {
      if (val === undefined || val === '') return false;
      return boolean(val as string);
    }, z.boolean().default(false)),
    NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX: z.preprocess((val) => {
      if (val === undefined || val === '') return false;
      return boolean(val as string);
    }, z.boolean().default(false)),
    NEXT_PUBLIC_ANTHROPIC_USAGE_URL: z.string().default(defaultAnthropicUsageUrl),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_DEBUG: process.env.DEBUG,
    NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE: process.env.NEXT_PUBLIC_DEFAULT_TARGET_LANGUAGE,
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH: process.env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH,
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN: process.env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MIN,
    NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX: process.env.NEXT_PUBLIC_DEFAULT_STORY_LENGTH_MAX,
    NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL: process.env.NEXT_PUBLIC_DEFAULT_DIFFICULTY_LEVEL,
    NEXT_PUBLIC_DEFAULT_TOPIC: process.env.NEXT_PUBLIC_DEFAULT_TOPIC,
    NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY: process.env.NEXT_PUBLIC_DEFAULT_INCLUDE_VOCABULARY,
    NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR: process.env.NEXT_PUBLIC_DEFAULT_INCLUDE_GRAMMAR,
    NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX: process.env.NEXT_PUBLIC_DISABLE_VOCABULARY_CHECKBOX,
    NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX: process.env.NEXT_PUBLIC_DISABLE_GRAMMAR_CHECKBOX,
    NEXT_PUBLIC_ANTHROPIC_USAGE_URL: process.env.NEXT_PUBLIC_ANTHROPIC_USAGE_URL,
  },
});
