import { FailOverOptions, ProviderFn, Provider } from './types';
import { fetchValuationFromSuperCar } from './super-car/super-car-valuation';
import { fetchValuationFromPremiumCar } from './premium-car/premium-car-valuation';

export function createValuationFetcher(
  superCarProvider: ProviderFn,
  premiumCarProvider: ProviderFn,
  options: FailOverOptions = { failureThreshold: 0.5, failOverDurationMs: 5 * 60 * 1000 }
): ProviderFn {
  let totalRequests = 0;
  let failedRequests = 0;
  let inFailOver = false;
  let failOverTimer: NodeJS.Timeout | null = null;

  return async (vrm: string, mileage: number) => {
    if (inFailOver) {
      try {
        return await premiumCarProvider(vrm, mileage, Provider.PROVIDER_PREMIUM);
      } catch {
        throw new Error('Both providers unavailable');
      }
    }

    totalRequests++;
    try {
      return await superCarProvider(vrm, mileage, Provider.PROVIDER_SUPERCAR);
    } catch (err) {
      console.error(err as Error);
      failedRequests++;
      if (
        totalRequests > 0 &&
        failedRequests / totalRequests > options.failureThreshold
      ) {
        inFailOver = true;
        if (failOverTimer) clearTimeout(failOverTimer);
        failOverTimer = setTimeout(() => {
          inFailOver = false;
          totalRequests = 0;
          failedRequests = 0;
        }, options.failOverDurationMs);
      }
      try {
        return await premiumCarProvider(vrm, mileage, Provider.PROVIDER_PREMIUM);
      } catch {
        throw new Error('Both providers unavailable');
      }
    }
  };
}

export const fetchValuationWithFailover = createValuationFetcher(
  fetchValuationFromSuperCar,
  fetchValuationFromPremiumCar,
  {
    failureThreshold: 0.5,
    failOverDurationMs: Number(process.env.FAILOVER_DURATION_MS) || 5 * 60 * 1000,
  }
);