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

  //location of risk
  houseNumber: string;
  village: string;
  buildingName: string;
  streetName: string;
  barangay: string;
  region: number;
  province: number;
  city: number;

  //building/content details
  buidlingCapital: number;
  contentValue: number;

  constructionOfBuilding: string;
  occupancyOfBuilding: string;

  front: string;
  right: string;
  left: string;
  rear: string;

  //general information
  effectivityDate: Date;
  expiryDate: Date;
  
  //product
  paymentMethod: number;
  product: number;

  constructor() {}
}
