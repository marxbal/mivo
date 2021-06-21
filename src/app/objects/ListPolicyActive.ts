export class ListPolicyActive {
  policyNumber: String;
  policyEffectivityDate: String;
  policyDueDate: String;
  line: String;
  policyHolder: String;
  documentType: String;
  documentCode: String;
  source: String;
  type: String;
  
  constructor(init?: Partial<ListPolicyActive>) {
    Object.assign(this, init);
  }
}
