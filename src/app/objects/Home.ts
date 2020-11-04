// * - used in quick quotation
export class Home {
  subline: string; // *
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

  currency: number;

  constructor() {}
}
