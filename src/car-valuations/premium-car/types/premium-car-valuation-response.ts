export interface PremiumCarValuationResponse {
  root: {
    RegistrationDate: string[];
    RegistrationYear: string[];
    RegistrationMonth: string[];
    ValuationPrivateSaleMinimum: number[];
    ValuationPrivateSaleMaximum: number[];
    ValuationDealershipMinimum: number[];
    ValuationDealershipMaximum: number[];
  };
}