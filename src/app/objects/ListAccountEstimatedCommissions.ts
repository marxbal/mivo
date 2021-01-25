export class ListAccountEstimatedCommissions {
  policyNumber: String;
  policyHolder: String;
  currency: String;
  invoiceNumber: String;
  movementDate: String;
  receiptAmount: String;
  estimatedCommission: String;
  source: String;
  type: String;

  constructor(init ? : Partial < ListAccountEstimatedCommissions > ) {
    Object.assign(this, init);
  }
}
