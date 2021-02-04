import {
    Injectable
  } from '@angular/core';
  import 'rxjs/add/operator/map';
import { PaymentRequest } from '../objects/PaymentRequest';
  import {
    AppService
  } from './app.service'
  
  @Injectable()
  export class PaymentService {
    constructor(
      private app: AppService) {}

    getPaymentUrl(paymentRequest: PaymentRequest) {
        return this.app.post({ ...paymentRequest, responseUrl: 'http://localhost:4200?successPage=true' }, '/payment/getPaymentRequest').then(response => response);
    }
  }