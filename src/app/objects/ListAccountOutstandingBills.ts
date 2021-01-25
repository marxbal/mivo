export class ListAccountOutstandingBills {
  policyNumber: String;
  policyHolder: String;
  prn: String;
  incomeVoice: String;
  currency: String;
  effectivityDate: String;
  expiryDate: String;
  paymentDateExpiry: String;
  age: String;
  amount: String;
  paymentStatus: String;
  source: String;
  subline: String;

  constructor(init ? : Partial < ListAccountOutstandingBills > ) {
    Object.assign(this, init);
  }
}
