export class ListPolicyNotRenewed {
  policyNumber: String;
  policyEffectivityDate: String;
  policyDueDate: String;
  line: String;
  policyHolder: String;
  source: String;
  type: String;

  constructor(init ? : Partial < ListPolicyNotRenewed > ) {
    Object.assign(this, init);
  }
}
