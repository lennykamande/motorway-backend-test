import { fastify as buildFastify } from 'fastify';
import { VehicleValuationRequest } from '@app/domain';

import { valuationRoutes } from '@app/valuation/routes/valuationRouter';

import * as fetchValuationWithFailover from '@app/car-valuations/car-valuation';

const findOneByMock = vi.fn();
const insertMock = vi.fn();

const successResponse = {
  vrm: 'ABC123',
  lowestValue: 12000,
  highestValue: 15000,
  provider: 'SuperCar',
  midpointValue: 13500,
}

describe('ValuationController (e2e)', () => {
  let fastify: ReturnType<typeof buildFastify>;
  beforeEach(() =>{
    fastify = buildFastify();

    const mockRepo = {
      findOneBy: findOneByMock,
      insert: insertMock,
    };

    fastify.decorate('orm', {
      getRepository: vi.fn().mockReturnValue(mockRepo),
    });

    vi.mock('@app/super-car/super-car-valuation', () => ({
      fetchValuationFromSuperCarValuation: vi.fn().mockResolvedValue({
        vrm: 'ABC123',
        mileage: 10000,
        value: 12345,
        createdAt: new Date(),
      }),
    }));

    valuationRoutes(fastify);
    fastify.ready();
    
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('PUT /valuations/', () => {
    it('should return 503 if all valuation providers fail', async () => {

      vi.spyOn(fetchValuationWithFailover, 'fetchValuationWithFailover')
        .mockRejectedValueOnce(new Error('All providers down'));

      const requestBody = { mileage: 10000 };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toBe(503);
    });

    it('should return 404 if VRM is missing', async () => {
      const requestBody = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const requestBody = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/12345678',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        // @ts-expect-error intentionally malformed payload
        mileage: null,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is negative', async () => {
      const requestBody = {
        mileage: -1,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 200 with valid request', async () => {
      findOneByMock.mockResolvedValue(null);
      insertMock.mockResolvedValue({ identifiers: [{ id: 1 }] });

      vi.spyOn(fetchValuationWithFailover, 'fetchValuationWithFailover').
      mockResolvedValue(successResponse);

      const requestBody = { mileage: 10000 };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toBe(200);
      const json = await res.json();
      expect(json.vrm).toBe('ABC123');
      expect(json.provider).toBe('SuperCar');
    });


    it('should return existing valuation if found in DB', async () => {
      findOneByMock.mockResolvedValue({
        vrm: 'ABC123',
        mileage: 10000,
        lowestValue: 1000,
        highestValue: 2000,
        provider: 'TestProvider',
      });

      const requestBody = { mileage: 10000 };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toBe(200);
      const json = await res.json();
      expect(json.vrm).toBe('ABC123');
      expect(json.provider).toBe('TestProvider');
    });
  });
});
