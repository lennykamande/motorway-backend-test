import { beforeAll, afterAll } from 'vitest'
import { app } from '@app/app'
import { baseLogger } from '@app/logger'
import { dbTypes } from '@app/database/types/databaseConnections'


export const fastify = await app({
    opts: {
      logger: baseLogger,
      pluginTimeout: 50000,
      bodyLimit: 15485760,
    },
    dbConfig: {
      type: dbTypes.sqlite,
      database: process.env.DATABASE_PATH ?? ':memory:',
      synchronize: process.env.SYNC_DATABASE === 'true',
    }
  });

beforeAll(async () => {
  await fastify.ready()
})
afterAll(async () => {
  await fastify.close()
})
