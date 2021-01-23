export class ListPolicyRenewed {
  policyNumber: String;
  policyEffectivityDate: String;
  policyDueDate: String;
  policyHolder: String;
  documentType: String;
  documentCode: String;
  type: String;
  
  constructor(init?: Partial<ListPolicyRenewed>) {
    Object.assign(this, init);
  }
}
