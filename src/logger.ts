import pino from 'pino';

export const baseLogger = pino(
  import.meta.env.DEV
    ? {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    }
    : {
      level: 'warn',
    }
);

export const createLoggerWithContext = (
  correlationId?: string,
  parsedResponse?: unknown
) =>
  baseLogger.child({
    correlationId,
    ...(parsedResponse && { parsedResponse }),
  });
