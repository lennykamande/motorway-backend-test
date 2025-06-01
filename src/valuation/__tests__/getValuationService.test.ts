import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getValuationService } from '@app/valuation/services'; // Adjust path as needed
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { FastifyInstance } from 'fastify';

describe('getValuationService', () => {
  let mockFindOneBy: ReturnType<typeof vi.fn>;
  let mockGetRepository: ReturnType<typeof vi.fn>;
  let mockFastify: Pick<FastifyInstance, 'orm'>;

  beforeEach(() => {
    mockFindOneBy = vi.fn();
    mockGetRepository = vi.fn(() => ({
      findOneBy: mockFindOneBy,
    }));
    mockFastify = {
      orm: {
        getRepository: mockGetRepository,
      },
    };
  });


  it('should return vehicle valuation when found', async () => {
    const mockResult = {
      vrm: 'ABC123',
      lowestValue: 10000,
      highestValue: 15000,
      provider: 'SuperCar',
      midpointValue: 12500
    } as VehicleValuation;

    mockFindOneBy.mockResolvedValueOnce(mockResult);

    const result = await getValuationService(mockFastify, { vrm: 'ABC123' });

    expect(mockGetRepository).toHaveBeenCalledWith(VehicleValuation);
    expect(mockFindOneBy).toHaveBeenCalledWith({ vrm: 'ABC123' });
    expect(result).toEqual(mockResult);
  });

  it('should return null if no valuation is found', async () => {
    mockFindOneBy.mockResolvedValueOnce(null);

    const result = await getValuationService(mockFastify, { vrm: 'XYZ999' });

    expect(result).toBeNull();
  });
});
