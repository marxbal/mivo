export class ListAccountPremiumCollection {
  policyNumber: String;
  currency: String;
  subline: String;
  invoiceNumber: String;
  effectivityDate: String;
  expiryDate: String;
  collectedDate: String;
  collectionType: String;
  receiptAmount: String;
  netPremium: String;
  surcharge: String;
  tax: String;
  interest: String;
  source: String;
  type: String;

  constructor(init ? : Partial < ListAccountPremiumCollection > ) {
    Object.assign(this, init);
  }
}
