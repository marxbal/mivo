import {
  Component,
  OnInit,
  Inject
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatTableDataSource
} from '@angular/material';
import {
  SlideInOutAnimation
} from 'src/app/utils/animation';
import {
  Utility
} from 'src/app/utils/utility';
// import {
//   CarQuoteServices
// } from 'src/app/services/car-quote.service';
// import {
//   TravelIssueServices
// } from 'src/app/services/travel-issue.service';
// import {
//   AccidentIssueServices
// } from 'src/app/services/accident-issue.service';
import {
  PrintingService
} from 'src/app/services/printing.service';
import {
  page
} from 'src/app/constants/page';

export interface TablesDTO {
  effectivityDate: string;
  dueDate: string;
  premium: number;
  netPremium: number;
  tax: number;
  commission: number;
}

@Component({
  selector: 'app-payment-breakdown-modal',
  templateUrl: './payment-breakdown-modal.component.html',
  styleUrls: ['./payment-breakdown-modal.component.css'],
  animations: [SlideInOutAnimation]
})
export class PaymentBreakdownModalComponent implements OnInit {

  constructor(
    // private cqs: CarQuoteServices,
    // private tis: TravelIssueServices,
    // private ais: AccidentIssueServices,
    private ps: PrintingService,
    public dialogRef: MatDialogRef < PaymentBreakdownModalComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  payments: any[] = [];
  number = this.data.number;
  product = this.data.product;
  payment = this.data.payment;
  isPostPolicy = this.data.isPostPolicy;
  line = this.data.line;

  ngOnInit(): void {
    this.data.receipt.forEach((receipt) => {
      var exchangeRate = receipt["valCambio"];
      var currency = receipt["codMon"];
      var paymentNumber = receipt["numCuota"];

      var paymentBreakdown = [];
      this.data.breakdown.forEach((breakdown) => {
        var breakdownNumber = breakdown["numCuota"];
        if (breakdownNumber == paymentNumber) {
          paymentBreakdown.push(breakdown);
        }
      });

      var currencyCode = "PHP";
      if (currency == "2") {
        currencyCode = "USD";
      } else if (currency == "3") {
        currencyCode = "EUR"
      }

      var efectivityDate = new Date(receipt["fecEfecRecibo"].substr(0, 10));
      var dueDate = new Date(receipt["fecVctoRecibo"].substr(0, 10));

      const data: TablesDTO[] = [{
        effectivityDate: Utility.formatDate(efectivityDate),
        dueDate: Utility.formatDate(dueDate),
        premium: receipt["impRecibo"],
        netPremium: receipt["impNeta"],
        tax: receipt["impImptos"],
        commission: receipt["impComis"],
      }];
      var dataSource = new MatTableDataSource(data);
      const obj = {
        exchangeRate: exchangeRate,
        currency: currency,
        paymentNumber: paymentNumber,
        currencyCode: currencyCode,
        dataSource: dataSource,
        displayedColumns: ['effectivityDate', 'dueDate', 'premium', 'netPremium', 'tax', 'commission'],
        animationState: 'out',
        showExchangeRate: this.data.showExchangeRate,
        toggleLabel: 'Show Economic Values',
        paymentBreakdown: paymentBreakdown
      };
      this.payments.push(obj);
    });
  }

  toggle(index: number) {
    this.payments[index].animationState = this.payments[index].animationState === 'out' ? 'in' : 'out';
    this.payments[index].toggleLabel = (this.payments[index].animationState === 'out' ? 'Show' : 'Hide') + ' Economic Values';
  }

  close(b: boolean): void {
    this.dialogRef.close(b);
  }

  printPolicy() {
    this.ps.printPolicy(this.data.number);
  }

  printQuote() {
    this.ps.printQuote(this.data.number);
  }

  proceedToIssuance(line: string) {
    this.dialogRef.close(false);
    if (line == "CAR") {
      // this.cqs.proceedToIssuance(this.data.number);
      this.ps.proceedToIssuance(this.data.number, page.ISS.CAR);
    } else if (line == "TRAVEL") {
      // this.tis.proceedToIssuance(this.data.number);
      this.ps.proceedToIssuance(this.data.number, page.ISS.TRA);
    } else if (line == "ACCIDENT") {
      // this.ais.proceedToIssuance(this.data.number);
      this.ps.proceedToIssuance(this.data.number, page.ISS.ACC);
    } else if (line == "HOME") {
      this.ps.proceedToIssuance(this.data.number, page.ISS.HOM);
    }
  }

}