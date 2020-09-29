import {
  PolicyHolder
} from './PolicyHolder';
import {
  GroupPolicy
} from './GroupPolicy';

// * - used in quick quotation
export class Accident {
  primaryInsuredAge: number; // *
  cbSpouseAge: boolean; // *
  spouseAge: number; // *
  cbChildNumber: boolean; // *
  childNumber: number; // *

  quotationNumber: string;

  //risk details
  subline: string; // *

  //general information
  effectivityDate: Date;
  expiryDate: Date;

  //policy holder information
  lastName: string;
  firstName: string;

  //group policy
  groupPolicy: GroupPolicy;

  //policy holder information
  policyHolder: PolicyHolder;

  //insured details
  middleName: string;
  suffix: string;
  gender: string;
  relationship: string;
  birthDate: Date;
  cbWithHealthDeclaration: boolean;
  preExistingIllness: string;
  occupationalClass: string; // *
  occupation: string;

  //accident death and disablement value
  disablementValue: number; // *

  product: string;

  constructor() {}
}
