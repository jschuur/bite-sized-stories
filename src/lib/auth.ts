import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

import { db } from '@/db';
import * as schema from '@/db/schema';

import { env } from '@/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
      canCreateStory: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
      canCreateAudio: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
});
