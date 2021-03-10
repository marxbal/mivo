import {
  Injectable
} from '@angular/core';
import 'rxjs/add/operator/map';
import {
  PaymentRequest
} from '../objects/PaymentRequest';
import {
  AppService
} from './app.service'
import { environment } from '../../environments/environment';
import { AccountService } from './account.service';

@Injectable()
export class PaymentService {

  private baseUrl = environment.baseUrl;

  constructor(
    private app: AppService,
    private accountService: AccountService) {}

  getPaymentUrl(paymentRequest: PaymentRequest) {
    return this.app.post({
      ...paymentRequest,
      responseUrl: this.baseUrl + '?successPage=true'
    }, '/payment/getPaymentRequest').then(response => response);
  }

  getPaymentUrlViaGlobalPay(invoiceNo: String) {
    return this.app.post({
      invoiceNo,
      responseUrl: this.baseUrl + '?successPage=true',
      againUrl: this.baseUrl + '?successPage=true',
    }, '/payment/getPaymentRequest/globalpay').then(response => response);
  }

  processPaymentViaGlobalPay(params: any) {
    return this.app.post(params, '/payment/paymentNotification/globalpay').then(response => {
      this.accountService.shouldReloadOutstandingBills.next(true);
      return response;
    });
  }
}