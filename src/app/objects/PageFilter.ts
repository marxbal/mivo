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

  // for policy active list
  paPolicyNumber: String = "";
  paEffectivityDate: String = "";
  paDueDate: String = "";
  paLine: String = "";
  paPolicyHolder: String = "";
  paDocumentType: String = "";
  paDocumentCode: String = "";
  paSource: String = "";

  // for policy cancelled list
  pcPolicyNumber: String = "";
  pcEffectivityDate: String = "";
  pcLine: String = "";
  pcPolicyHolder: String = "";
  pcSource: String = "";

  constructor(init ? : Partial < PageFilter > ) {
    Object.assign(this, init);
  }
}
