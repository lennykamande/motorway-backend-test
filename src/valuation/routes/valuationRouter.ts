import { FastifyInstance } from 'fastify';

import { valuationHandler } from '@app/valuation/controllers/getValuationDetailsRequest';
import { getValuationService, putValuationService } from '@app/valuation/services'
import { responseHandler } from '@app/utils/responseHandler';
import { getValuationDetailsUseCase, putValuationDetailsUseCase } from '@app/valuation/useCases';


export function valuationRoutes(fastify: FastifyInstance) {
  fastify.get('/valuations/:vrm', valuationHandler(getValuationService, responseHandler, getValuationDetailsUseCase));
  fastify.put('/valuations/:vrm', valuationHandler(putValuationService, responseHandler, putValuationDetailsUseCase));
}
