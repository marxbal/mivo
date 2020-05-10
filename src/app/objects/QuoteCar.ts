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

export class QuoteCar {
  quotationNumber: string;
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

  //accessories
  accessories: Array < Accessory > = [];

  //policy holder information
  clientName: string;

  policyHolder: PolicyHolder;

  //groupPolicy
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

  //subagent and policy holder
  beneficiaries: Array < Beneficiary > = [];

  //products
  paymentMethod: number;
  productList: number;

  subAgent: any[];

  constructor(init ? : Partial < QuoteCar > ) {
    Object.assign(this, init);
  }
}
