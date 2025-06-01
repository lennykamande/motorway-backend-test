export class ValidationError extends Error {
  public readonly httpStatus: number;
  public readonly statusCode: number;
  public readonly errorMessage: string;
  public readonly originalError?: unknown;

  constructor(message: string, status: number = 400, code: number = 400, originalError?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.httpStatus = status;
    this.statusCode = code;
    this.errorMessage = message;
    this.originalError = originalError;
  }
}