// * - used in quick quotation
export class Home {
  mcaTmpPptoMph: string;
  affecting: boolean;

  subline: number; // *
  sublineEffectivityDate: string;

  cbBuilding: boolean; // *
  building: number = 0; // *
  cbContent: boolean; // *
  content: number = 0; // *
  cbImprovements: boolean; // *
  improvements: number = 0; // *
  cbRelatedBuild: boolean; // *
  relatedBuild: number = 0; // *
  cbRelatedContent: boolean; // *
  relatedContent: number = 0; // *

  policyNumber: string
  quotationNumber: string;

  currency: number;

  //general information
  effectivityDate: Date;
  expiryDate: Date;

  constructor() {}
}
