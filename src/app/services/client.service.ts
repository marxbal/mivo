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
  PageFilterClient
} from '../objects/PageFilterClient';

@Injectable()
export class ClientService {

  constructor(private app: AppService) {}

  async getClientDetailsList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/clientDetails').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyActiveList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/active').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyCancelledList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/cancelled').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyRenewedList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/renewed').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyNotRenewedList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/notRenewed').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyExpiringList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/expiring').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPolicyProvisionalList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/policy/provisional').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getQuotationActiveList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/quotation/active').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getQuotationProvisionalList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/quotation/provisional').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getClaimsList(pageFilter: PageFilterClient): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/claims').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}