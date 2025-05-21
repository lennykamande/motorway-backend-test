import { describe, it, expect, beforeEach } from 'vitest';
import { FastifyInstance, fastify } from 'fastify';
import * as databaseConnection from '../database/database';
import { dbTypes } from '../database/types/database-connections'

describe('registerDb', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = fastify();
  });

  it('should register the ORM with an in-memory sqlite database', async () => {

     await databaseConnection.registerDb(app, {
      type: dbTypes.sqlite,
      database: ':memory:',
      synchronize: true,
    });

    await app.ready();
    // Check that the orm is defined

    expect(app.orm).toBeDefined();
    expect(app.orm.isInitialized).toBe(true);

    const entities = app.orm.entityMetadatas.map((meta) => meta.name);
    expect(entities).toContain('VehicleValuation');
  });

  it('should call registerDb with correct parameters', async () => {
    const registerSpy = vi.spyOn(app, 'register');
    const databaseRegister = vi.spyOn(databaseConnection, 'registerDb');
    const dbConfig = {
      type: dbTypes.sqlite,
      database: ':memory:',
      synchronize: true,
    };

    await databaseConnection.registerDb(app, dbConfig);

    expect(registerSpy).toHaveBeenCalledTimes(1);
    expect(databaseRegister).toHaveBeenCalledTimes(1);
  });
});
