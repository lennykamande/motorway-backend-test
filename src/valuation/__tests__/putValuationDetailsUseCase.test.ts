import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { putValuationDetailsUseCase } from '@app/valuation/useCases/putValuationDetailsUseCase';
import { ValidationError } from '@app/data';
import { FastifyInstance } from 'fastify';
import { valuationService } from '@app/domain';
import { ResponseHandlerWithResponse } from '@app/utils/responseHandler';

describe('putValuationDetailsUseCase', () => {
  let mockValuationService: valuationService
  let mockResponseHandler: ResponseHandlerWithResponse;
  let mockFastify: FastifyInstance;

  beforeEach(() => {
    mockValuationService = vi.fn() as unknown as valuationService;
    mockResponseHandler = vi.fn();
    mockFastify = {} as FastifyInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call valuationService and return parsedResponse', async () => {
    const parameters = { vrm: 'ABC123', mileage: 10000 };
    const mockParsedResponse = { vrm: 'ABC123', value: 12000 };
    mockValuationService.mockResolvedValue(mockParsedResponse);

    await putValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockValuationService).toHaveBeenCalledWith(mockFastify, parameters);
    expect(mockResponseHandler).toHaveBeenCalledWith({ parsedResponse: mockParsedResponse });
  });

  it('should call responseHandler with ValidationError for invalid VRM', async () => {
    const parameters = { vrm: '', mileage: 10000 }; // invalid VRM

    await putValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockResponseHandler).toHaveBeenCalledWith({
      error: expect.any(ValidationError),
    });
  });

  it('should call responseHandler with ValidationError for invalid mileage', async () => {
    const parameters = { vrm: 'ABC123', mileage: -100 }; // invalid mileage

    await putValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockResponseHandler).toHaveBeenCalledWith({
      error: expect.any(ValidationError),
    });
  });

  it('should call responseHandler with error if valuationService fails', async () => {
    const parameters = { vrm: 'ABC123', mileage: 10000 };
    const error = new Error('Service unavailable');
    mockValuationService.mockRejectedValue(error);

    await putValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockResponseHandler).toHaveBeenCalledWith({ error });
  });
});
