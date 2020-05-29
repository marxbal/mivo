export class PolicyHolder {
  organization: boolean = true;
  name: string;
  documentType: string;
  documentCode: string;
  
  constructor(init?: Partial<PolicyHolder>) {
    Object.assign(this, init);
  }
}
