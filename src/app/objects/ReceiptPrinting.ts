export class ReceiptPrinting {
  prn: String;
  invoiceNumber: String;
  subline: number;
  constructor(init ? : Partial < ReceiptPrinting > ) {
    Object.assign(this, init);
  }
}
