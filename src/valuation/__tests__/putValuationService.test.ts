import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fastify as buildFastify } from 'fastify';

import { putValuationService } from '@app/valuation/services/putValuationService';
import { ValidationError } from '@app/data';
import { fetchValuationWithFailover } from '@app/car-valuations/car-valuation';


const findOneByMock = vi.fn();
const insertMock = vi.fn();

vi.mock('@app/car-valuations/car-valuation', () => ({
  fetchValuationWithFailover: vi.fn(),
}));

describe('putValuationService', () => {
  let fastify: ReturnType<typeof buildFastify>;
  beforeEach(() => {
    fastify = buildFastify();

    const mockRepo = {
      findOneBy: findOneByMock,
      insert: insertMock,
    };

    fastify.decorate('orm', {
      getRepository: vi.fn().mockReturnValue(mockRepo),
    });

    vi.mock('@app/super-car/super-car-valuation', () => ({
      fetchValuationFromSuperCarValuation: vi.fn().mockResolvedValue({
        vrm: 'ABC123',
        mileage: 10000,
        value: 12345,
        createdAt: new Date(),
      }),
    }));

    fastify.ready();
  });

    it('should return existing valuation if found', async () => {
    const mockValuation = {
      vrm: 'ABC123',
      mileage: 10000,
      provider: null,
      value: 12345,
    };

      findOneByMock.mockResolvedValueOnce(mockValuation);

    const result = await putValuationService(fastify, { vrm: 'ABC123', mileage: 10000 });

    expect(result).toEqual({
      ...mockValuation,
      provider: 'Unknown',
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('should fetch and insert valuation when not in DB', async () => {
    findOneByMock.mockResolvedValueOnce(null);
    insertMock.mockResolvedValue({ identifiers: [{ id: 1 }] });

    const mockFetchedValuation = {
      vrm: 'ABC123',
      mileage: 10000,
      provider: 'SuperCar',
      value: 15000,
      createdAt: new Date(),
    };

    (fetchValuationWithFailover as unknown as vi.Mock).mockResolvedValueOnce(mockFetchedValuation);

    const result = await putValuationService(fastify, { vrm: 'ABC123', mileage: 10000 });

    expect(fetchValuationWithFailover).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith(mockFetchedValuation);
    expect(result).toEqual(mockFetchedValuation);
  });

  it('should throw ValidationError when fetchValuationWithFailover fails', async () => {
    findOneByMock.mockResolvedValueOnce(null);
    const err = new Error('Service unavailable');

    (fetchValuationWithFailover as unknown as vi.Mock).mockRejectedValueOnce(err);

    await expect(() =>
      putValuationService(fastify, { vrm: 'DEF456', mileage: 12345 })
    ).rejects.toThrow(ValidationError);
  });

  it('should ignore SQLITE_CONSTRAINT errors during insert', async () => {
    findOneByMock.mockResolvedValueOnce(null);

    const mockValuation = {
      vrm: 'XYZ789',
      mileage: 15000,
      provider: 'SuperCar',
      value: 12000,
      createdAt: new Date(),
    };

    (fetchValuationWithFailover as unknown as vi.Mock).mockResolvedValueOnce(mockValuation);
    insertMock.mockRejectedValueOnce({ code: 'SQLITE_CONSTRAINT' });

    const result = await putValuationService(fastify, { vrm: 'XYZ789', mileage: 15000 });

    expect(result).toEqual(mockValuation);
    expect(insertMock).toHaveBeenCalledWith(mockValuation);
  });

  it('should rethrow non-SQLITE_CONSTRAINT errors', async () => {
    findOneByMock.mockResolvedValueOnce(null);

    const mockValuation = {
      vrm: 'XYZ789',
      mileage: 15000,
      provider: 'SuperCar',
      value: 12000,
      createdAt: new Date(),
    };

    (fetchValuationWithFailover as unknown as vi.Mock).mockResolvedValueOnce(mockValuation);
    const unexpectedError = new Error('Database insert failed');
    (unexpectedError as any).code = 'SOME_OTHER_ERROR';
    insertMock.mockRejectedValueOnce(unexpectedError);

    await expect(() =>
      putValuationService(fastify, { vrm: 'XYZ789', mileage: 15000 })
    ).rejects.toThrow('Database insert failed');
  });
});
