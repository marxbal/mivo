export class RequestDetails {
  type: String;
  requestType: String;
  issueType: String;
  policyNumber: String;
  reason: String;
  agentEmail: String;
  name: String;

  requestor: String;
  noOfItems: number;
  previousPolicyNumber: String;

  type1: String;
  type2: String;
  type3: String;

  branch: String;
  line: String;
  subline: String;
  typeOfPolicy: String;
  clientName: String;
  clientGroup: String;
  copyNotify: String;
  comments: String;

  files: File[];
  
  constructor(init?: Partial<RequestDetails>) {
    Object.assign(this, init);
  }
}
