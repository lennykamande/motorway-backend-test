export type VehicleValuationResponse = {
  vrm: string;
  lowestValue: number;
  highestValue: number;
  provider?: string;
  midpointValue: number;
}