import { defineConfig } from 'drizzle-kit';

import { env } from '@/env';

console.log(`Using database URL: ${env.DATABASE_URL}`);

console.log();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
});
