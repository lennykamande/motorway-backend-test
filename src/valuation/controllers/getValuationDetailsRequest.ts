import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { VehicleValuationRequest, valuationService, ValuationDetailsType } from '@app/domain/vehicleValuationRequest';
import { ResponseHandler } from '@app/utils/responseHandler';
import { generateUUID } from '@app/utils/uuidGenerator';

type UseCase = (
  fastify: FastifyInstance,
  attributes: ValuationDetailsType
) => Promise<void>;

export const valuationHandler =
  (valuationService: valuationService, responseHandler: ResponseHandler, useCase:UseCase
    ) =>
  (request: FastifyRequest<{ Params: { vrm: string }; Body: { mileage?: number } }>, reply: FastifyReply) => {

    const { vrm } = request.params;
    const { mileage } = request.body ?? '';

    const correlationId: string = generateUUID();
    const parameters: VehicleValuationRequest = { vrm, mileage };

   void useCase(request.server,{
     valuationService: valuationService,
     parameters: parameters,
     responseHandler: responseHandler(reply, correlationId),
   })
  };
  