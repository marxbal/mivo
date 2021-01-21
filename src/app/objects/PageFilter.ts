export class PageFilter {
  currentPage: number;
  pageSize: number;
  sortBy: String;
  sortOrder: String;

  constructor(init ? : Partial < PageFilter > ) {
    Object.assign(this, init);
  }
}
