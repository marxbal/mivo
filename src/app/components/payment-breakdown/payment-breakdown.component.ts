import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import {
  MatTableDataSource
} from '@angular/material/table';
import {
  SlideInOutAnimation
} from '../../utils/animation';
import {
  Utility
} from 'src/app/utils/utility';

export interface TablesDTO {
  effectivityDate: string;
  dueDate: string;
  premium: number;
  netPremium: number;
  tax: number;
  commission: number;
}

@Component({
  selector: 'app-payment-breakdown',
  templateUrl: './payment-breakdown.component.html',
  styleUrls: ['./payment-breakdown.component.css'],
  animations: [SlideInOutAnimation]
})
export class PaymentBreakdownComponent implements OnInit {
  @Input() paymentBreakdown: any[];
  @Input() paymentReceipt: any[];
  @Input() showExchangeRate: boolean;
  @Input()
  set loadBreakdown(value: number) {
    this.triggerCounter = value;
    this.generateBreakdown();
  }

  payments: any[] = [];
  triggerCounter: number;

  constructor() {}

  ngOnInit(): void {
    this.generateBreakdown();
  }

  generateBreakdown() {
    this.payments = [];
    this.paymentReceipt.forEach((receipt)=>{
      var exchangeRate = receipt["valCambio"];
      var currency = receipt["codMon"];
      var paymentNumber = receipt["numCuota"];

      var paymentBreakdown = [];
      this.paymentBreakdown.forEach((breakdown)=>{
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
        showExchangeRate: this.showExchangeRate,
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

}