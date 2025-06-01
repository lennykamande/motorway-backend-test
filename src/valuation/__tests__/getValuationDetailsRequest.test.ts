import { FastifyReply, FastifyRequest } from 'fastify';
import { valuationHandler } from '@app/valuation/controllers/getValuationDetailsRequest';

describe('valuationHandler', () => {
  it('should call useCase with correct parameters', async () => {
    const mockUseCase = vi.fn().mockResolvedValue(undefined);
    const mockResponseHandler = vi.fn().mockImplementation(() => () => {});
    const mockValuationService = vi.fn();

    const mockRequest = {
      params: { vrm: 'ABC123' },
      body: { mileage: 10000 },
      server: { some: 'instance' },
    } as unknown as FastifyRequest;

    const mockReply = {} as FastifyReply;

    const handler = valuationHandler(mockValuationService, mockResponseHandler, mockUseCase);

    await handler(mockRequest, mockReply);

    expect(mockUseCase).toHaveBeenCalledWith(
      mockRequest.server,
      {
        valuationService: mockValuationService,
        parameters: { vrm: 'ABC123', mileage: 10000 },
        responseHandler: expect.any(Function),
      }
    );

    expect(mockResponseHandler).toHaveBeenCalledTimes(1);
  });
});
