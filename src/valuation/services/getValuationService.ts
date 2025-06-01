import { FastifyInstance } from 'fastify';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { valuationService, VehicleValuationResponse } from '@app/domain';

export const getValuationService: valuationService = async (
  fastify: FastifyInstance,
  parameters: { vrm: string }
): Promise<VehicleValuationResponse> => {
  const { vrm } = parameters;
  const vehicleRepository = fastify.orm.getRepository(VehicleValuation);
  // @ts-expect-error error is caught
  return vehicleRepository.findOneBy({ vrm });
};