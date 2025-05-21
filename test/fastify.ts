import { beforeAll, afterAll } from 'vitest'
import { app } from '@app/app'
import { logger } from '@app/logger'
import { dbTypes } from '@app/database/types/database-connections'


export const fastify = await app({
    opts: {
      logger,
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
  // called once before all tests run
  await fastify.ready()
})
afterAll(async () => {
  // called once after all tests run
  await fastify.close()
})
