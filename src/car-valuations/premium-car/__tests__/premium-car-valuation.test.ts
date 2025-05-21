import { describe, expect, it, vi } from 'vitest';
import { fetchValuationFromPremiumCar } from '../premium-car-valuation';
import { VehicleValuation } from '@app/models/vehicle-valuation';
// @ts-expect-error as it want me to install types
import * as xml2js from 'xml2js';
import axios from 'axios';
import { Provider } from '@app/car-valuations/types';

vi.mock('axios');
vi.mock('xml2js', async () => {
  const actual = await vi.importActual<typeof xml2js>('xml2js');
  return {
    ...actual,
    parseStringPromise: vi.fn(),
  };
});

describe('fetchValuationFromPremiumCar', () => {
  it('parses XML and returns a VehicleValuation', async () => {
    const mockXml = '<root><ValuationDealershipMinimum>9500</ValuationDealershipMinimum><ValuationPrivateSaleMaximum>12750</ValuationPrivateSaleMaximum></root>';
    const mockParsed = {
      root: {
        ValuationDealershipMinimum: ['9500'],
        ValuationPrivateSaleMaximum: ['12750'],
      }
    };

    (axios.get as any).mockResolvedValue({ data: mockXml });
    (xml2js.parseStringPromise as any).mockResolvedValue(mockParsed);

    const result = await fetchValuationFromPremiumCar('ABC123', 10000, Provider.PROVIDER_PREMIUM);

    expect(result).toBeInstanceOf(VehicleValuation);
    expect(result.vrm).toBe('ABC123');
    expect(result.lowestValue).toBe(9500);
    expect(result.highestValue).toBe(12750);
    expect(result.provider).toBe('Premium Car Valuations');
  });
});