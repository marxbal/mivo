import {
  Injectable
} from '@angular/core';
import {
  AppService
} from './app.service';
import {
  Car
} from '../objects/Car';
import {
  Home
} from '../objects/Home';
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  Travel
} from '../objects/Travel';
import {
  Accident
} from '../objects/Accident';

@Injectable()
export class QuickQuoteService {
  constructor(private app: AppService) {}

  async checkRoadAssist(carDetails: Car): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quickquote/checkRoadAssist').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async quickQuoteCar(carDetails: Car): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quickquote/car').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async quickQuoteHome(homeDetails: Home): Promise < ReturnDTO > {
    return this.app.post(homeDetails, '/quickquote/home').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async quickQuoteTravel(travelDetails: Travel): Promise < ReturnDTO > {
    return this.app.post(travelDetails, '/quickquote/travel').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async quickQuoteAccident(accidentDetails: Accident): Promise < ReturnDTO > {
    return this.app.post(accidentDetails, '/quickquote/accident').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}
