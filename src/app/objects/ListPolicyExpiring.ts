export class ListPolicyExpiring {
  policyNumber: String;
  policyEffectivityDate: String;
  policyExpiryDate: String;
  policyHolder: String;
  email: String;
  telephoneNumber: String;
  type: String;
  
  constructor(init?: Partial<ListPolicyExpiring>) {
    Object.assign(this, init);
  }
}
