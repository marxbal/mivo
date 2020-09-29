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

// * - used in quick quotation
export class QuoteCar {
  affecting: boolean;
  isModifiedCoverage: boolean;
  mcaTmpPptoMph: string;
  quotationNumber: string;
  policyNumber: string;

  //vehicle information
  make: number; // *
  model: number; // *
  vehicleType: number; // *
  modelYear: string; // *
  subModel: number; // *
  typeOfUse: number; // *
  vehicleValue: number; // *
  subline: number; // *
  sublineEffectivityDate: string; // * change effectivityDate to sublineEffectivityDate
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
  secondaryPolicyHolderSeparator: string;
  secondaryPolicyHolder: PolicyHolder;
  assigneePolicyHolder: PolicyHolder;
  mortgageePolicyHolder: PolicyHolder;

  //group policy
  groupPolicy: GroupPolicy;

  //general information
  effectivityDate: Date;
  expiryDate: Date;

  //additional policy information
  customRiskName: string; //NOM_RIESGO_CUSTOM
  seatingCapacity: number; //NUM_PLAZAS
  weight: string; //VAL_PESO
  displacement: string; //VAL_CC
  classification: number; //TIP_VEHI_PESO
  coverageArea: number; //COD_AREA_COVER
  assuredsCoinsuranceShare: string; //PCT_CLI_COINS
  cbWaivedMinPremium: boolean; //MCA_WAIVE_MIN_PREM
  cbPrepaidPremium: boolean; //MCA_PREPAID_PREM
  cbGlassEtchingEntitled: boolean; //MCA_GLASS_ETCHING
  glassEtchingAvailmentDate: Date; //FEC_GLASS_ETCHING
  existingDamages: string; //TXT_EXT_DAM_PARTS
  inspectionAssessment: number; //TXT_EXT_DAM_PARTS
  
  //additional policy information for issuance
  cbPolicyOnlyDriver: boolean; //MCA_DRIVER
  cbPolicyOwner: boolean; //MCA_OWNER
  cbHasAssignee: boolean; //MCA_ASSIGNEE
  cbVehicleMortgaged: boolean; //MCA_MORTGAGED
  mortgageClause: number; //TIP_MORT_CLAUSE

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
