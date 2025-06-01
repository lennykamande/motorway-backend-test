import 'reflect-metadata';
import { FastifyInstance } from 'fastify';
import databaseConnection from 'typeorm-fastify-plugin';
import { DataSource, EntityTarget, Repository, ObjectLiteral } from 'typeorm';

import { VehicleValuation } from '@app/models/vehicle-valuation';
import { dbTypes, DbConfig} from '@app/database/types/databaseConnections';

const connection = (type: dbTypes, database: string, synchronize: boolean): DataSource => new DataSource({
	type: type,
	database: database,
	username: 'your_username',
  entities: [VehicleValuation],
  synchronize: synchronize,
  logging: true,
});

// refactor to have single responsibility
export async function registerDb(fastify: FastifyInstance, config: DbConfig): Promise<void> {
  await fastify.register(databaseConnection, {connection: connection(config.type, config.database, config.synchronize)});
}

/* handles the repository for the given entity */
// this is a generic function that takes a Fastify instance and an entity target
export const repositoryHandler = <T extends ObjectLiteral>(
  fastify: FastifyInstance,
  entity: EntityTarget<T>
): Repository<T> => {
  return fastify.orm.getRepository(entity);
};