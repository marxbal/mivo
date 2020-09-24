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
  Travel
} from '../objects/Travel';

@Injectable()
export class TravelUtilityServices {
  constructor(private app: AppService) {}

  async getOneTrip(travelDetails: Travel): Promise < ReturnDTO > {
    return this.app.post(travelDetails, '/travel/getOneTrip').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}
