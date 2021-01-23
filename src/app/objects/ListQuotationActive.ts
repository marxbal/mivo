export class ListQuotationActive {
  quotationNumber: String;
  policyEffectivityDate: String;
  policyDueDate: String;
  line: String;
  policyHolder: String;
  source: String;
  type: String;
  
  constructor(init?: Partial<ListQuotationActive>) {
    Object.assign(this, init);
  }
}
