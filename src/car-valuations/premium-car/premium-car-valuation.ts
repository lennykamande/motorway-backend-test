import axios from 'axios';
// @ts-expect-error as it want me to install types
import { parseStringPromise } from 'xml2js';

import { PremiumCarValuationResponse } from '@app/car-valuations/premium-car/types/premium-car-valuation-response';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { Provider } from '@app/car-valuations/types';

export const premiumCarValuationUrl: string = 'https://run.mocky.io/v3/dc947956-a4ea-4821-b1e0-460b6e2654e9';

export async function fetchValuationFromPremiumCar (
  vrm: string, 
  mileage: number,
  provider: Provider
): Promise<VehicleValuation> {
  /*
    potential refactor is have one backendUrl Request method that does the axios configuration and pass path and typing of response
    assumption is that the DealershipMinimum is the lowest value and PrivateSaleMaximum is the highest value
    this is based on the mocky stub response
  */
  axios.defaults.baseURL = premiumCarValuationUrl;

  const response = await axios.get<PremiumCarValuationResponse>(
    `valuations/${vrm}?mileage=${mileage}`, {responseType: 'text'}
  );

  const parsedResponse = await parseStringPromise(response.data);

  const valuation = new VehicleValuation();

  valuation.vrm = vrm;

  valuation.lowestValue = Number(parsedResponse.root.ValuationDealershipMinimum);
  valuation.highestValue = Number(parsedResponse.root.ValuationPrivateSaleMaximum);
  valuation.provider = provider;

  return valuation;
}