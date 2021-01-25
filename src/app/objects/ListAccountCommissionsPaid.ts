export class ListAccountCommissionsPaid {
  policyNumber: String;
  policyHolder: String;
  currency: String;
  invoiceNumber: String;
  receiptAmount: String;
  commissionAmount: String;
  withholdingTaxAmount: String;
  source: String;

  constructor(init ? : Partial < ListAccountCommissionsPaid > ) {
    Object.assign(this, init);
  }
}
