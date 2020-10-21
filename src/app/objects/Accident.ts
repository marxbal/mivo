import {
  PolicyHolder
} from './PolicyHolder';
import {
  GroupPolicy
} from './GroupPolicy';
import {
  InsuredDetails
} from './InsuredDetails';

// * - used in quick quotation
export class Accident {
  mcaTmpPptoMph: string;
  affecting: boolean;
  primaryInsuredAge: number; // *
  cbSpouseAge: boolean; // *
  spouseAge: number; // *
  cbChildNumber: boolean; // *
  childNumber: number; // *
  occupationalClass: string; // *

  policyNumber: string
  quotationNumber: string;

  //risk details
  subline: number; // *
  sublineEffectivityDate: string; //*

  //general information
  effectivityDate: Date;
  expiryDate: Date;

  //group policy
  groupPolicy: GroupPolicy;

  //policy holder information
  policyHolder: PolicyHolder;

  //insured details
  insuredDetails: [InsuredDetails];

  //accident death and disablement value
  disablementValue: number; // *

  product: number;

  constructor() {}
}
