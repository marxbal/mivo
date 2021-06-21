export class RenewalPrinting {
  year: number;
  month: number;
  policyNumber: String;
  constructor(init?: Partial<RenewalPrinting>) {
    Object.assign(this, init);
  }
}
