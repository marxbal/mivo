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
export class AccountService {

  constructor(private app: AppService) {}

  async getCOutstandingBillsList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/outstandingBills').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getCommissionsPaidList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/commissionsPaid').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getEstimatedCommissionsList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/estimatedCommissions').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPremiumCollectionList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/premiumCollection').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}