export class ListQuotationProvisional {
  quotationNumber: String;
  policyEffectivityDate: String;
  policyDueDate: String;
  line: String;
  policyHolder: String;
  source: String;
  type: String;
  
  constructor(init?: Partial<ListQuotationProvisional>) {
    Object.assign(this, init);
  }
}
