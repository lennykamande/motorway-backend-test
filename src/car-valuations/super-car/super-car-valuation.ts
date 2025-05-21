import axios from 'axios';

import { VehicleValuation } from '@app/models/vehicle-valuation';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';
import { Provider } from '@app/car-valuations/types';

const superCarValuationUrl: string = 'https://run.mocky.io/v3/e222925b-b86e-4c10-a186-eb74ee76f0fa';

export async function fetchValuationFromSuperCar(
  vrm: string,
  mileage: number,
  provider: Provider,
): Promise<VehicleValuation> {
  axios.defaults.baseURL = superCarValuationUrl;
  
  const response = await axios.get<SuperCarValuationResponse>(
    `valuations/${vrm}?mileage=${mileage}`,
  );

  const valuation = new VehicleValuation();

  valuation.vrm = vrm;
  valuation.lowestValue = response.data.valuation.lowerValue;
  valuation.highestValue = response.data.valuation.upperValue;
  valuation.provider = provider

  return valuation;
}
