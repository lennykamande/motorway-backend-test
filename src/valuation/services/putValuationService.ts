import { FastifyInstance } from 'fastify';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { VehicleValuationResponse, valuationService, VehicleValuationRequest } from '@app/domain';
import { fetchValuationWithFailover } from '@app/car-valuations/car-valuation';
import { Provider } from '@app/car-valuations/types';
import { ValidationError } from '@app/data';

export const putValuationService: valuationService = async (
  fastify: FastifyInstance,
  parameters: VehicleValuationRequest
): Promise<VehicleValuationResponse> => {
  const { vrm, mileage } = parameters;

  const vehicleRepository = fastify.orm.getRepository(VehicleValuation);


  const existing = await vehicleRepository.findOneBy({ vrm });
  if (existing) {
    return {
      ...existing,
      midpointValue: existing.midpointValue,
      provider: existing.provider ?? 'Unknown',
    };
  }

  let valuation: VehicleValuation;
  try {
    valuation = await fetchValuationWithFailover(vrm, Number(mileage), Provider.PROVIDER_SUPERCAR);
  } catch (err) {
    throw new ValidationError('All valuation providers unavailable', 503, 503, err);
  }

  await vehicleRepository.insert(valuation).catch((err) => {
    if (err.code !== 'SQLITE_CONSTRAINT') {
      throw err;
    }
  });

  fastify.log.info('Valuation created: ', valuation);

  return valuation;
};
