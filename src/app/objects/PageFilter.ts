export class PageFilter {
  currentPage: number;
  pageSize: number;
  sortBy: String;
  sortOrder: String;

  // for request list
  requestType: String = "";
  requestId: String = "";
  policyNumber: String = "";
  status: String = "";
  requestHandler: String = "";
  user: String = "";

  // for client details list
  cdName: String = "";
  cdDocumentType: String = "";
  cdDocumentCode: String = "";
  cdAddress: String = "";
  cdHomeTelNumber: String = "";
  cdBusinessTelNumber: String = "";
  cdMobileNumber: String = "";
  cdEmail: String = "";

  constructor(init ? : Partial < PageFilter > ) {
    Object.assign(this, init);
  }
}
