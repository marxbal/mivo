import {
  Traveller
} from './Traveller';
import {
  PolicyHolder
} from './PolicyHolder';
import {
  GroupPolicy
} from './GroupPolicy';

export class Travel {
  policyNumber: string;
  quotationNumber: string;
  subline: number;

  //travel itinerary
  currency: string;
  country: [Object];
  travelPackage: string;
  typeOfCoverage: string;
  travelType: string;
  startDate: Date;
  endDate: Date;
  noOfDays: number;
  completeItinerary: string;
  purposeOfTrip: string; //qqtravel purposeTrip
  oneTripOnly: string;
  ageRange: string;

  //group policy
  groupPolicy: GroupPolicy;

  //policy holder information
  clientName: string;
  policyHolder: PolicyHolder;

  //travellers
  travellers: [Traveller];

  //additional policy information
  cbSportsEquipment: boolean;
  sportsEquipment: string;
  cbHazardousSports: boolean;
  hazardousSports: string;

  //coverages
  travelInsurance: string;
  optionPack: string;
  medicalExpenses: string;

  constructor(init ? : Partial < Travel > ) {
    Object.assign(this, init);
  }
}
