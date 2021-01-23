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
}