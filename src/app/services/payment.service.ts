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

@Injectable()
export class PaymentService {
  constructor(
    private app: AppService) {}

  getPaymentUrl(paymentRequest: PaymentRequest) {
    return this.app.post({
      ...paymentRequest,
      responseUrl: 'http://localhost:4200?successPage=true'
    }, '/payment/getPaymentRequest').then(response => response);
  }

  getPaymentUrlViaGlobalPay(invoiceNo: String) {
    return this.app.post({
      invoiceNo,
      responseUrl: 'https://localhost:4200?successPage=true',
      againUrl: 'https://localhost:4200?successPage=true',
    }, '/payment/getPaymentRequest/globalpay').then(response => response);
  }

  processPaymentViaGlobalPay(params: any) {
    return this.app.post(params, '/payment/paymentNotification/globalpay').then(response => response);
  }
}