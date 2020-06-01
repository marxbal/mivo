import {
  Accessory
} from './Accessory';
import {
  Beneficiary
} from './Beneficiary';
import {
  GroupPolicy
} from './GroupPolicy';
import {
  PolicyHolder
} from './PolicyHolder';
import {
  Coverage
} from './Coverage';
import {
  CoverageVariableData
} from './CoverageVariableData';

export class QuoteCar {
  mcaTmpPptoMph: string;
  quotationNumber: string;
  policyNumber: string;

  //vehicle information
  make: number;
  model: number;
  vehicleType: number;
  modelYear: string;
  subModel: number;
  typeOfUse: number;
  vehicleValue: number;
  subline: number;
  sublineEffectivityDate: string;
  color: number;
  areaOfUsage: number;
  conductionNumber: string;
  plateNumber: string;
  serialNumber: string;
  engineNumber: string;
  mvFileNumber: string;
  purchaseDate: Date;
  receivedBy: string;
  receivedDate: Date;

  //CTPL
  automaticAuth: string;
  registrationType: string;
  mvType: string;
  cocNumber: string;
  cbIsNotRequiredAuthNumber: boolean;
  authNumber: string;

  //accessories
  accessories: Array < Accessory > = [];

  //policy holder information
  clientName: string;
  policyHolder: PolicyHolder;
  secondaryPolicyHolderPrefix: number;
  secondaryPolicyHolderSeparator: number;
  secondaryPolicyHolder: PolicyHolder;
  assigneePolicyHolder: PolicyHolder;
  mortgageePolicyHolder: PolicyHolder;

  //group policy
  groupPolicy: GroupPolicy;

  //general information
  effectivityDate: Date;
  expiryDate: Date;

  //additional policy information
  customRiskName: string;
  seatingCapacity: number;
  weight: string;
  displacement: string;
  classification: number;
  coverageArea: number;
  assuredsCoinsuranceShare: string;
  cbWaivedMinPremium: boolean;
  cbPrepaidPremium: boolean;
  cbGlassEtchingEntitled: boolean;
  glassEtchingAvailmentDate: Date;
  existingDamages: string;
  inspectionAssessment: number;
  //additional policy information for issuance
  cbPolicyOnlyDriver: boolean;
  cbPolicyOwner: boolean;
  cbHasAssignee: boolean;
  cbVehicleMortgaged: boolean;
  mortgageClause: number;

  //subagent and policy holder
  beneficiaries: Array < Beneficiary > = [];

  //products
  paymentMethod: number;
  productList: number;

  //sub agents
  subAgent: any[];

  //coverages
  coverages: Array < Coverage > = [];

  //coverage variable data
  coverageVariableData: CoverageVariableData;

  constructor(init ? : Partial < QuoteCar > ) {
    Object.assign(this, init);
  }
}
