import { FastifyReply as Response } from 'fastify';
import { createLoggerWithContext } from '@app/logger';

export const DEFAULT_ERROR_CODE: number = 404;

export type ErrorResponse = {
  statusCode: number;
  errorMessage: string;
  httpStatus: number;
};

export type ResponseForUser<T> = {
  parsedResponse?: Readonly<T>;
  error?: Readonly<Error | ErrorResponse>;
};

export type ResponseHandlerWithResponse = <T>(response: Readonly<ResponseForUser<T>>) => void;

export type ResponseHandler = (response: Response, correlationId?: string) => ResponseHandlerWithResponse;

export const responseHandler =
  (response: Response, correlationId = '') =>
    <T>({ parsedResponse, error }: Readonly<ResponseForUser<T>>): void => {
      const logger = createLoggerWithContext(correlationId, parsedResponse);

      if (error) {
        if ('statusCode' in error && 'errorMessage' in error && 'httpStatus' in error) {
          logger.error('Failed with error: ', error);
          response.status(error.httpStatus).send({
            message: error.errorMessage,
            statusCode: error.statusCode,
          });
          return;
        }

        // Fallback for generic Error
        const errorCode = (error as any).code ?? '';
        const errorMessage = (error as any).response?.title
          ? (error as any).response.data
          : error.message || '';

        logger.error('Failed with error: ', {
          code: errorCode,
          message: error.message,
          response: (error as any).response ?? '',
        });

        response.status((error as any)._httpStatus ?? DEFAULT_ERROR_CODE).send(errorMessage);
      } else {
        logger.info('Sending response to client');

        response.send(parsedResponse);
      }
    };
