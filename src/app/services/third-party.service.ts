import {
  Injectable
} from '@angular/core';
import {
  AppService
} from './app.service';
import {
  ReturnDTO
} from '../objects/ReturnDTO';

@Injectable()
export class ThirdPartyService {
  constructor(private app: AppService) {}

  async getThirdPartyList(activity: number, firstName: string, lastName: string): Promise < ReturnDTO > {
    return this.app.post({
      activity,
      firstName,
      lastName
    }, '/thirdParty/getThirdPartyList').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getThirdPartyDetails(documentType: string, documentCode: string): Promise < ReturnDTO > {
    return this.app.post({
      documentType,
      documentCode
    }, '/thirdParty/getThirdPartyDetails').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}
