import {
  Injectable
} from '@angular/core';
import {
  AppService
} from './app.service';
import {
  QQCar
} from '../objects/QQCar';
import {
  QQHome
} from '../objects/QQHome';
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  Travel
} from '../objects/Travel';
import {
  QQAccident
} from '../objects/QQAccident';

@Injectable()
export class QuickQuoteService {
  constructor(private app: AppService) {}

  async quickQuoteCar(carDetails: QQCar): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quickquote/car').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async checkRoadAssist(carDetails: QQCar): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quickquote/checkRoadAssist').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async quickQuoteHome(homeDetails: QQHome): Promise < ReturnDTO > {
    return this.app.post(homeDetails, '/quickquote/home').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async quickQuoteTravel(travelDetails: Travel): Promise < ReturnDTO > {
    return this.app.post(travelDetails, '/quickquote/travel').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async quickQuoteAccident(accidentDetails: QQAccident): Promise < ReturnDTO > {
    return this.app.post(accidentDetails, '/quickquote/accident').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}
