// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'bite-sized-stories',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    const { env } = await import('./src/env');

    new sst.x.DevCommand('Turso', {
      dev: {
        command: 'pnpm run dev:db',
      },
    });

    const environment = Object.fromEntries(
      Object.entries(env).map(([key, value]) => [key, String(value)]),
    );

    console.log('hostname: ', env.SITE_HOSTNAME);

    new sst.aws.Nextjs('Site', {
      domain: env.SITE_HOSTNAME,
      environment,
      dev: {
        command: 'pnpm run dev-cmd',
      },
      server: {
        timeout: '60 seconds',
        // TODO: Make this work with just @libsql/client/web again and without installing @libsql/linux-x64-gnu
        // Currently requires to resolve `Cannot find module '@libsql/linux-x64-gnu'` error: https://github.com/tursodatabase/libsql-client-ts/issues/112
        install: ['libsql/linux-x64-gnu'],
      },
    });
  },
});
