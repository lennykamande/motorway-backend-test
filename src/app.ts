import 'reflect-metadata';

import { fastify as Fastify, FastifyInstance, FastifyServerOptions } from 'fastify';

import { valuationRoutes } from '@app/routes/valuation';
import {registerDb, repositoryHandler } from '@app/database/database';
import { DbConfig } from '@app/database/types/database-connections';
import { VehicleValuation } from '@app/models/vehicle-valuation';

interface AppOptions {
  opts?: FastifyServerOptions;
  dbConfig: DbConfig;
}

/**
 * Creates a Fastify instance with the given options and registers the database connection.
 *
 * @param {AppOptions} options - The options for creating the Fastify instance.
 * @param {FastifyServerOptions} [options.opts] - Optional Fastify server options.
 * @param {DbConfig} options.dbConfig - The database configuration.
 * @returns {Promise<FastifyInstance>} - A promise that resolves to the Fastify instance.
 */

export const app = async ({ opts, dbConfig }: AppOptions): Promise<FastifyInstance> => {
  const fastify = Fastify(opts);
 
  await registerDb(fastify, dbConfig);

  fastify.get('/', async () => {
    return { hello: 'world' };
  });

  const vehicleRepo = repositoryHandler<VehicleValuation>(fastify, 'VehicleValuation');
  valuationRoutes(fastify, vehicleRepo);

  return fastify;
};