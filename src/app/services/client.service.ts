import {
  Injectable
} from '@angular/core';
import {
  AppService
} from './app.service';
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  PageFilter
} from '../objects/PageFilter';

@Injectable()
export class ClientService {

  constructor(private app: AppService) {}

  async getClientDetailsList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/clientDetails').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyActiveList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/active').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyCancelledList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/cancelled').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyRenewedList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/renewed').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyNotRenewedList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/notRenewed').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyExpiringList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/expiring').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyProvisionalList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/provisional').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getQuotationActiveList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/quotation/active').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getQuotationProvisionalList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/quotation/provisional').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}