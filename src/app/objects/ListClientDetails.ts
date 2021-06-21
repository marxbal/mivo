export class ListClientDetails {
  name: String;
  documentType: String;
  documentCode: String;
  address: String;
  homeTelNumber: String;
  businessTelNumber: String;
  mobileNumber: String;
  email: String;
  type: String;
  
  constructor(init?: Partial<ListClientDetails>) {
    Object.assign(this, init);
  }
}
