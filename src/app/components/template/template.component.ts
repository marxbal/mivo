import {
  Component,
  OnInit
} from '@angular/core';
import {
  Globals
} from '../../utils/global';
import {
  page
} from '../../constants/page';
import {
  ActivatedRoute
} from '@angular/router';
import {
  filter
} from 'rxjs/operators';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  p = page; //constant pages

  constructor(private route: ActivatedRoute, private paymentService: PaymentService) {}

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        if (params.invoiceNo) {
          this.processPayment(params);
        }
      });
    this.route.queryParams
      .pipe(filter(params => params.successPage))
      .subscribe(params => {
        if (params.successPage) {
          Globals.setPage(this.p.ACC.OUT);
        }
      });
  }

  get page() {
    return Globals.page;
  }

  processPayment(params: any) {
    this.paymentService.processPaymentViaGlobalPay(params).then(response => {
      console.log('response: ', response);
    });
  }
}
