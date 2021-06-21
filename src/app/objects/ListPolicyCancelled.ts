export class ListPolicyCancelled {
  policyNumber: String;
  policyEffectivityDate: String;
  line: String;
  policyHolder: String;
  source: String;
  type: String;
  
  constructor(init?: Partial<ListPolicyCancelled>) {
    Object.assign(this, init);
  }
}
