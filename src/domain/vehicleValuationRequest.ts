import { FastifyInstance } from 'fastify';
import { ResponseHandlerWithResponse } from '@app/utils/responseHandler';
import { VehicleValuationResponse } from '@app/domain/vehicleValuationResponse';

export type VehicleValuationRequest = {
  vrm: string;
  mileage?: number;
};

export type valuationService = (
  fastify: FastifyInstance,
  parameter: Readonly<VehicleValuationRequest>
) => Promise<VehicleValuationResponse>;

export type ValuationDetailsType = {
  valuationService: valuationService;
  parameters: VehicleValuationRequest;
  responseHandler: ResponseHandlerWithResponse;
};
