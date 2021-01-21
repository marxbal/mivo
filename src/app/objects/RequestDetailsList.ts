export class RequestDetailsList {
  requestType: String;
  requestId: String;
  policyNumber: String;
  status: number;
  requestHandler: String;
  user: String;
  
  constructor(init?: Partial<RequestDetailsList>) {
    Object.assign(this, init);
  }
}
