import { describe, it, expect, vi, beforeEach } from 'vitest';
import { responseHandler, DEFAULT_ERROR_CODE, ErrorResponse } from '@app/utils/responseHandler';
import { FastifyReply } from 'fastify';

const mockSend = vi.fn();
const mockStatus = vi.fn(() => ({ send: mockSend }));
const mockResponse = {
  status: mockStatus,
  send: mockSend,
} as unknown as FastifyReply;

vi.mock('@app/logger', () => ({
  createLoggerWithContext: vi.fn(() => ({
    error: vi.fn(),
    info: vi.fn(),
  })),
}));

describe('responseHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a successful parsed response', () => {
    const handler = responseHandler(mockResponse, 'abc-123');
    const data = { foo: 'bar' };

    handler({ parsedResponse: data });

    expect(mockSend).toHaveBeenCalledWith(data);
  });

  it('should handle a custom ErrorResponse object', () => {
    const handler = responseHandler(mockResponse, 'xyz-789');

    const error: ErrorResponse = {
      statusCode: 1001,
      errorMessage: 'Validation failed',
      httpStatus: 400,
    };

    handler({ error });

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockSend).toHaveBeenCalledWith({
      message: 'Validation failed',
      statusCode: 1001,
    });
  });

  it('should handle a generic Error with .message', () => {
    const handler = responseHandler(mockResponse);
    const error = new Error('Something went wrong');

    handler({ error });

    expect(mockStatus).toHaveBeenCalledWith(DEFAULT_ERROR_CODE);
    expect(mockSend).toHaveBeenCalledWith('Something went wrong');
  });

  it('should handle a generic error with ._httpStatus override', () => {
    const handler = responseHandler(mockResponse);
    const error = new Error('Server overloaded');
    (error as any)._httpStatus = 503;

    handler({ error });

    expect(mockStatus).toHaveBeenCalledWith(503);
    expect(mockSend).toHaveBeenCalledWith('Server overloaded');
  });

  it('should handle custom error object with nested response data', () => {
    const handler = responseHandler(mockResponse);
    const error = {
      message: 'Failed',
      response: {
        title: 'Oops',
        data: 'Detailed error info',
      },
    };

    handler({ error: error as any });

    expect(mockStatus).toHaveBeenCalledWith(DEFAULT_ERROR_CODE);
    expect(mockSend).toHaveBeenCalledWith('Detailed error info');
  });
});
