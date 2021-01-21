export class RequestDetailsList {
  requestType: String;
  requestId: String;
  policyNumber: String;
  status: String;
  requestHandler: String;
  user: String;
  
  constructor(init?: Partial<RequestDetailsList>) {
    Object.assign(this, init);
  }
}
