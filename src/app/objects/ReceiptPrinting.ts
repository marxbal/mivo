export class ReceiptPrinting {
  prn: String;
  invoiceNumber: String;
  subline: String;
  constructor(init ? : Partial < ReceiptPrinting > ) {
    Object.assign(this, init);
  }
}
