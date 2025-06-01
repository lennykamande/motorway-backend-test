import 'reflect-metadata';

import { fastify as Fastify, FastifyInstance, FastifyServerOptions } from 'fastify';

import { valuationRoutes } from '@app/valuation/routes/valuationRouter';
import {registerDb } from '@app/database/database';
import { DbConfig } from '@app/database/types/databaseConnections';



interface AppOptions {
  opts?: FastifyServerOptions;
  dbConfig: DbConfig;
}

export const app = async ({ opts, dbConfig }: AppOptions): Promise<FastifyInstance> => {
  const fastify = Fastify(opts);
 
  await registerDb(fastify, dbConfig);

  fastify.get('/', async () => {
    return { hello: 'world' };
  });

  valuationRoutes(fastify);

  return fastify;
};