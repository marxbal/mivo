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

  // for policy renewed list
  prPolicyNumber: String = "";
  prEffectivityDate: String = "";
  prDueDate: String = "";
  prPolicyHolder: String = "";
  prDocumentType: String = "";
  prDocumentCode: String = "";

  // for policy not renewed list
  pnPolicyNumber: String = "";
  pnEffectivityDate: String = "";
  pnDueDate: String = "";
  pnLine: String = "";
  pnPolicyHolder: String = "";
  pnSource: String = "";

  // for policy expiring list
  pePolicyNumber: String = "";
  peEffectivityDate: String = "";
  peExpiryDate: String = "";
  pePolicyHolder: String = "";
  peEmail: String = "";
  peTelephoneNumber: String = "";

  // for policy provisional list
  ppPolicyNumber: String = "";
  ppEffectivityDate: String = "";
  ppDueDate: String = "";
  ppLine: String = "";
  ppPolicyHolder: String = "";
  ppSource: String = "";

  // for quotation active list
  qaQuotationNumber: String = "";
  qaEffectivityDate: String = "";
  qaDueDate: String = "";
  qaLine: String = "";
  qaPolicyHolder: String = "";
  qaSource: String = "";

  // for quotation provisional list
  qpQuotationNumber: String = "";
  qpEffectivityDate: String = "";
  qpDueDate: String = "";
  qpLine: String = "";
  qpPolicyHolder: String = "";
  qpSource: String = "";

  // for claims list
  clClaimNumber: String = "";
  clFileNumber: String = "";
  clFileName: String = "";
  clLossDate: String = "";
  clNotificationDate: String = "";
  clSource: String = "";

  constructor(init ? : Partial < PageFilter > ) {
    Object.assign(this, init);
  }
}
