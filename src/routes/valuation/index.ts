import { FastifyInstance } from 'fastify';
import { Repository } from 'typeorm';

import { fetchValuationWithFailover } from '@app/car-valuations/car-valuation';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { Provider } from '@app/car-valuations/types';


export function valuationRoutes(
  fastify: FastifyInstance, 
  repository: Repository<VehicleValuation>
) {
  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
  
    const { vrm } = request.params;

    if (vrm === null || vrm === '' || vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    const result = await repository.findOneBy({ vrm });

    if (result == null) {
      return reply
        .code(404)
        .send({
          message: `Valuation for VRM ${vrm} not found`,
          statusCode: 404,
        });
    }

    return result;
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {

    const { vrm } = request.params;
    const { mileage } = request.body;

    if (vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    if (mileage === null || mileage <= 0) {
      return reply
        .code(400)
        .send({
          message: 'mileage must be a positive number',
          statusCode: 400,
        });
    }

    const existing = await repository.findOneBy({ vrm });
    if (existing) {
      return reply.send({
        ...existing,
        provider: existing.provider ?? 'Unknown',
      });
    }

    let valuation: VehicleValuation;
    try {

      valuation = await fetchValuationWithFailover(vrm, mileage, Provider.PROVIDER_SUPERCAR);
    } catch (err) {
      return reply.code(503).send({ message: 'All valuation providers unavailable', statusCode: 503, error: err });
    }



    await repository.insert(valuation).catch((err) => {
      if (err.code !== 'SQLITE_CONSTRAINT') {
        throw err;
      }
    });

    fastify.log.info('Valuation created: ', valuation);

    return valuation;
  });
}
