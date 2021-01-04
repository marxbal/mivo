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
  Home
} from '../objects/Home';

@Injectable()
export class HomeIssueServices {

  constructor(private app: AppService,
  ) {}

  url = "/home/issue/";

  async issueQuote(homeDetails: Home): Promise < ReturnDTO > {
    return this.app.post(homeDetails, this.url + 'issueQuote').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async savePolicy(homeDetails: Home): Promise < ReturnDTO > {
    return this.app.post(homeDetails, this.url + 'savePolicy').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async postPolicy(homeDetails: Home): Promise < ReturnDTO > {
    return this.app.post(homeDetails, this.url + 'postPolicy').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async loadQuotation(quotationNumber: string): Promise < ReturnDTO > {
    return this.app.post({
      quotationNumber
    }, this.url + 'loadQuotation').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}