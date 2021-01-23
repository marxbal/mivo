export class ListClaimDetails {
  claimNumber: String;
  fileNumber: String;
  fileName: String;
  lossDate: String;
  notificationDate: String;
  reserveAmount: String;
  source: String;
  type: String;
  
  constructor(init?: Partial<ListClaimDetails>) {
    Object.assign(this, init);
  }
}
