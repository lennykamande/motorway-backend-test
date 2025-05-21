import './env';
import { app } from '@app/app';
import { logger } from '@app/logger';
import { dbTypes } from '@app/database/types/database-connections';

const serverOptions = {
  logger,
  pluginTimeout: 50000,
  bodyLimit: 15485760,
};

const dbConfig = {
  type: dbTypes.sqlite,
  database: process.env.DATABASE_PATH!,
  synchronize: process.env.SYNC_DATABASE === 'true',
};

let viteNodeApp;

const start = async () => {
  const server = await app({ opts:serverOptions, dbConfig });

  viteNodeApp = server;

  if (import.meta.env.PROD) {
    const PORT = 3000;
    try {
      await server.listen({ port: PORT, host: '0.0.0.0' });
      server.log.info(`Server started on 0.0.0.0:${PORT}`);
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  }
};

await start();

export { viteNodeApp };
