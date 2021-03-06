import {
  PolicyHolder
} from './PolicyHolder';
import {
  GroupPolicy
} from './GroupPolicy';

// * - used in quick quotation
export class Travel {
  affecting: boolean;
  mcaTmpPptoMph: string;
  policyNumber: string;
  quotationNumber: string;
  subline: number;

  //travel itinerary
  currency: number; // *
  countries: any[]; // *
  travelPackage: string; // *
  typeOfCoverage: string; // *
  travelType: string;
  startDate: Date; // *
  endDate: Date; // *
  noOfDays: number; // *
  completeItinerary: string;
  purposeOfTrip: string;
  cbOneTripOnly: boolean;
  cbWithCruise: boolean;
  ageRange: string; // *
  othersDescription: string;

  //group policy
  groupPolicy: GroupPolicy;

  //policy holder information
  policyHolder: PolicyHolder;

  //travelers
  travelers: any[];

  //additional policy information
  cbSportsEquipment: boolean;
  sportsEquipment: string;
  cbHazardousSports: boolean;
  hazardousSports: string;

  //coverages
  insuranceCoverage: string;
  coverageOption: string;
  medicalExpenses: string;
  product: number;

  constructor(init ? : Partial < Travel > ) {
    Object.assign(this, init);
  }
}
