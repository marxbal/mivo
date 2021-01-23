export class ListPolicyProvisional {
  policyNumber: String;
  policyEffectivityDate: String;
  policyDueDate: String;
  line: String;
  policyHolder: String;
  source: String;
  type: String;
  
  constructor(init?: Partial<ListPolicyProvisional>) {
    Object.assign(this, init);
  }
}
