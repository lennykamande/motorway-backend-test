import { ValuationDetailsType } from '@app/domain';
import { FastifyInstance } from 'fastify';
import { vrmValidator, ValidationError, mileageValidator } from '@app/data';

export const putValuationDetailsUseCase = async (
  fastify: FastifyInstance,
  {
    valuationService,
    parameters,
    responseHandler,
  }: ValuationDetailsType): Promise<void> => {
  const { vrm, mileage } = parameters;
  console.log(`car valuation details request received ${vrm}`);

  const { valid, error } = vrmValidator(vrm);
  if (!valid && error) {
    return responseHandler({
      error: new ValidationError(error.message, error.statusCode, error.code),
    });
  }

 const { valid: validMileage, error: mileageError } = mileageValidator(Number(mileage));
  if (!validMileage && mileageError) {
    return responseHandler({
      error: new ValidationError(mileageError.message, mileageError.statusCode, mileageError.code)
    });
  }
  
  try {
    const parsedResponse = await valuationService(fastify,parameters);
    responseHandler({ parsedResponse });
  } catch (error) {
    responseHandler({ error: error as Error });
  }
};