import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchValuationWithFailover } from '../car-valuation';
import { Provider } from '../types';
import { VehicleValuation } from '@app/models/vehicle-valuation';

import * as superCarModule from '@app/car-valuations/super-car/super-car-valuation';
import * as premiumCarModule from '@app/car-valuations/premium-car/premium-car-valuation';

vi.mock('@app/car-valuations/super-car/super-car-valuation', () => ({
  fetchValuationFromSuperCar: vi.fn(),
}));

vi.mock('@app/car-valuations/premium-car/premium-car-valuation', () => ({
  fetchValuationFromPremiumCar: vi.fn(),
}));

const mockValuation = (provider: Provider): VehicleValuation => ({
  vrm: 'ABC123',
  lowestValue: 1000,
  highestValue: 2000,
  midpointValue: 1500,
  provider,
});

describe('fetchValuationWithFailover (integration of default instance)', () => {
  const superCarMock = superCarModule.fetchValuationFromSuperCar as ReturnType<typeof vi.fn>;
  const premiumCarMock = premiumCarModule.fetchValuationFromPremiumCar as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    superCarMock.mockReset();
    premiumCarMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses superCar if available', async () => {
    superCarMock.mockResolvedValue(mockValuation(Provider.PROVIDER_SUPERCAR));
    const result = await fetchValuationWithFailover('ABC123', 10000, Provider.PROVIDER_SUPERCAR);
    expect(superCarMock).toHaveBeenCalledOnce();
    expect(premiumCarMock).not.toHaveBeenCalled();
    expect(result.provider).toBe(Provider.PROVIDER_SUPERCAR);
  });

  it('falls back to premiumCar on superCar failure', async () => {
    superCarMock.mockRejectedValue(new Error('superCar down'));
    premiumCarMock.mockResolvedValue(mockValuation(Provider.PROVIDER_PREMIUM));

    const result = await fetchValuationWithFailover('ABC123', 10000, Provider.PROVIDER_SUPERCAR);
    expect(superCarMock).toHaveBeenCalled();
    expect(premiumCarMock).toHaveBeenCalled();
    expect(result.provider).toBe(Provider.PROVIDER_PREMIUM);
  });

  it('throws if both providers fail', async () => {
    superCarMock.mockRejectedValue(new Error('fail'));
    premiumCarMock.mockRejectedValue(new Error('fail'));

    await expect(fetchValuationWithFailover('ABC123', 10000, Provider.PROVIDER_PREMIUM)).rejects.toThrow(
      'Both providers unavailable'
    );
  });

  it('enters failover mode and skips superCar once threshold exceeded', async () => {
    premiumCarMock.mockResolvedValue(mockValuation(Provider.PROVIDER_PREMIUM));
    superCarMock.mockRejectedValue(new Error('fail'));

    await fetchValuationWithFailover('A', 1, Provider.PROVIDER_SUPERCAR);
    await fetchValuationWithFailover('B', 2, Provider.PROVIDER_SUPERCAR);
    await fetchValuationWithFailover('C', 3, Provider.PROVIDER_SUPERCAR);

    await fetchValuationWithFailover('D', 4, Provider.PROVIDER_SUPERCAR);

    expect(premiumCarMock).toHaveBeenCalledTimes(4);
  });

});