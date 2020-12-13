import {
  GroupPolicy
} from './GroupPolicy';
import {
  PolicyHolder
} from './PolicyHolder';

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
  district: string;
  blockNumber: string;

  buildingNumber: string;
  subdivision: string;
  buildingName: string;
  streetName: string;
  barangay: string;
  region: number;
  province: number;
  city: number;

  //building/content details
  buildingCapital: number;
  contentValue: number;
  buildingContent: string;

  //rate percentage
  ratePercentage: number;

  constructionOfBuilding: string;
  occupancyOfBuilding: string;

  front: string;
  right: string;
  left: string;
  rear: string;

  improvement: number;
  relatedStructureDetails: [];
  relatedContentDetails: [];

  //general information
  effectivityDate: Date;
  expiryDate: Date;

  //group policy
  groupPolicy: GroupPolicy;

  //policy holder information
  policyHolder: PolicyHolder;
  //alternative policy holder information
  secondaryPolicyHolderPrefix: number;
  secondaryPolicyHolderSeparator: string;
  secondaryPolicyHolderSeparatorCode: number;
  secondaryPolicyHolder: PolicyHolder;
  //mortgagee policy holder information
  mortgageePolicyHolder: PolicyHolder;

  crestaZone: string;
  zipCode: number;
  cbMortgagee: boolean;

  warrantedNoLoss: string;

  //product
  paymentMethod: number;
  product: number;

  constructor() {}
}
