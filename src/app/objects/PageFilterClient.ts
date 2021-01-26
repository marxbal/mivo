export class PageFilterClient {
  currentPage: number;
  pageSize: number;
  sortBy: String;
  sortOrder: String;

  // common
  policyNumber: String = "";
  quotationNumber: String = "";
  documentType: String = "";
  documentCode: String = "";
  effectivityDate: String = "";
  dueDate: String = "";
  email: String = "";
  line: String = "";
  policyHolder: String = "";
  source: String = "";

  // for client details list
  name: String = "";
  address: String = "";
  homeTelNumber: String = "";
  businessTelNumber: String = "";
  mobileNumber: String = "";

  // for policy active list

  // for policy cancelled list

  // for policy renewed list

  // for policy not renewed list

  // for policy expiring list
  expiryDate: String = "";
  telephoneNumber: String = "";

  // for policy provisional list

  // for quotation active list

  // for quotation provisional list

  // for claims list
  claimNumber: String = "";
  fileNumber: String = "";
  fileName: String = "";
  lossDate: String = "";
  notificationDate: String = "";

  constructor(init ? : Partial < PageFilterClient > ) {
    Object.assign(this, init);
  }
}
