import { ValuationDetailsType } from '@app/domain';
import { FastifyInstance } from 'fastify';
import { vrmValidator } from '@app/data/vrmValidator';
import { ValidationError } from '@app/data';

export const getValuationDetailsUseCase = async (
  fastify: FastifyInstance,
  {
  valuationService,
  parameters,
  responseHandler,
}: ValuationDetailsType): Promise<void> => {
  const { vrm } = parameters;
  console.log(`car valuation details request received ${vrm}`);

 const { valid, error } = vrmValidator(vrm);
  if (!valid && error) {
    return responseHandler({
      error: new ValidationError(error.message, error.statusCode, error.code),
    });
  }

  try {
    const parsedResponse = await valuationService(fastify,parameters);

    if (parsedResponse === null) {
      const errorResponse = {
        statusCode: 404,
        errorMessage: `Valuation for VRM ${vrm} not found`,
        httpStatus: 404
      }
      return responseHandler({ error: errorResponse });
    }
    responseHandler({ parsedResponse });
  } catch (error) {
    responseHandler({ error: error as Error });
  }
};