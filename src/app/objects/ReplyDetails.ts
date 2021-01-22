export class ReplyDetails {
  requestType: String;
  requestId: String;
  message: String;
  agentEmail: String;
  name: String;
  
  constructor(init?: Partial<ReplyDetails>) {
    Object.assign(this, init);
  }
}
