export class UtilitiesQueryFilter {
    userName: string;
    param: string
    inquiryType: string
    paramName: string

  constructor(init ? : Partial < UtilitiesQueryFilter > ) {
    Object.assign(this, init);
  }
}
