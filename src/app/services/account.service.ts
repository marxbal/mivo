import {
  Injectable
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  AppService
} from './app.service';
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  PageFilterAccount
} from '../objects/PageFilterAccount';

@Injectable()
export class AccountService {

  public shouldReloadOutstandingBills: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private app: AppService) {}

  async getOutstandingBillsList(pageFilter: PageFilterAccount): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/outstandingBills').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getCommissionsPaidList(pageFilter: PageFilterAccount): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/commissionsPaid').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getEstimatedCommissionsList(pageFilter: PageFilterAccount): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/estimatedCommissions').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getPremiumCollectionList(pageFilter: PageFilterAccount): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/account/premiumCollection').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}