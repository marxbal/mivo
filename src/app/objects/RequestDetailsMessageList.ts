export class RequestDetailsMessageList {
  message: String;
  requestHandler: String;
  user: String;
  source: String;
  postDate: String;
  
  constructor(init?: Partial<RequestDetailsMessageList>) {
    Object.assign(this, init);
  }
}
