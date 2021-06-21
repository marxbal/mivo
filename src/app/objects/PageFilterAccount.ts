export class PageFilterAccount {
  currentPage: number;
  pageSize: number;
  sortBy: String;
  sortOrder: String;

  // common
  policyNumber: String = "";
  policyHolder: String = "";
  currency: String = "";
  source: String = "";
  invoiceNumber: String = "";
  receiptAmount: String = "";
  effectivityDate: String = "";
  expiryDate: String = "";
  subline: String = "";

  // for outstanding bills list
  prn: String = "";
  paymentDateExpiry: String = "";
  amount: String = "";
  paymentStatus: String = "";

  // for commissions paid list
  commissionAmount: String = "";
  withholdingTaxAmount: String = "";

  // for estimated commissions list
  movementDate: String = "";
  estimatedCommission: String = "";

  // for premium collection list
  collectedDate: String = "";
  collectionType: String = "";
  netPremium: String = "";
  surcharge: String = "";
  tax: String = "";
  interest: String = "";

  constructor(init ? : Partial < PageFilterAccount > ) {
    Object.assign(this, init);
  }
}
