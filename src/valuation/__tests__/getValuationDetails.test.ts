import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getValuationDetailsUseCase } from '@app/valuation/useCases/getValuationDetailsUseCase';
import { ValidationError } from '@app/data';
import type { FastifyInstance } from 'fastify';
import type { valuationService } from '@app/domain';


describe('getValuationDetailsUseCase', () => {
  let mockValuationService: valuationService;
  let mockResponseHandler: ReturnType<typeof vi.fn>;
  let mockFastify: FastifyInstance;

  beforeEach(() => {
    mockValuationService = vi.fn() as unknown as valuationService;
    mockResponseHandler = vi.fn();
    mockFastify = {} as FastifyInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call responseHandler with ValidationError if VRM is invalid', async () => {
    const parameters = { vrm: '', mileage: 10000 };

    await getValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockResponseHandler).toHaveBeenCalledWith({
      error: expect.any(ValidationError),
    });
  });

  it('should call responseHandler with a 404 error if parsedResponse is null', async () => {
    const parameters = { vrm: 'ABC123', mileage: 10000 };

    (mockValuationService as any).mockResolvedValue(null);

    await getValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockResponseHandler).toHaveBeenCalledWith({
      error: {
        statusCode: 404,
        errorMessage: `Valuation for VRM ABC123 not found`,
        httpStatus: 404,
      },
    });
  });

  it('should call responseHandler with parsedResponse if valuationService returns data', async () => {
    const parameters = { vrm: 'ABC123', mileage: 10000 };
    const parsedResponse = { vrm: 'ABC123', value: 15000 };

    (mockValuationService as any).mockResolvedValue(parsedResponse);

    await getValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockResponseHandler).toHaveBeenCalledWith({ parsedResponse });
  });

  it('should call responseHandler with error if valuationService throws an error', async () => {
    const parameters = { vrm: 'ABC123', mileage: 10000 };
    const serviceError = new Error('Service error');

    (mockValuationService as any).mockRejectedValue(serviceError);

    await getValuationDetailsUseCase(mockFastify, {
      valuationService: mockValuationService,
      parameters,
      responseHandler: mockResponseHandler,
    });

    expect(mockResponseHandler).toHaveBeenCalledWith({ error: serviceError });
  });
});
