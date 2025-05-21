import { VehicleValuation } from '@app/models/vehicle-valuation';

export const enum Provider { 
  PROVIDER_SUPERCAR = 'SuperCar Valuations',
  PROVIDER_PREMIUM = 'Premium Car Valuations'
};

export type ProviderFn = (vrm: string, mileage: number, provider: Provider ) => Promise<VehicleValuation>;

export interface FailOverOptions {
  failureThreshold: number;
  failOverDurationMs: number;
}