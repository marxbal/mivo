export class PageFilter {
  currentPage: number;
  pageSize: number;
  sortBy: String;
  sortOrder: String;

  requestType: String;
  requestId: String;
  policyNumber: String;
  status: String;
  requestHandler: String;
  user: String;

  constructor(init ? : Partial < PageFilter > ) {
    Object.assign(this, init);
  }
}
