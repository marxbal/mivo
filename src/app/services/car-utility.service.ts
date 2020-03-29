import {
  Injectable
} from '@angular/core';
import {
  AppService
} from '../services/app.service';
import {
  QQCar
} from '../objects/QQCar';
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  QuoteCar
} from '../objects/QuoteCar';

@Injectable()
export class CarUtilityServices {
  constructor(private app: AppService) {}

  async getFMV(carDetails: QQCar): Promise < ReturnDTO > {
    return this.app.doWhatever(carDetails, '/car/getFMV').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getSubline(carDetails: QQCar): Promise < ReturnDTO > {
    return this.app.doWhatever(carDetails, '/car/getSubline').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async validatePlateNumberFormat(carDetails: QuoteCar): Promise < ReturnDTO > {
    return this.app.doWhatever(carDetails, '/car/validatePlateNumberFormat').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async validateConductionNumberFormat(carDetails: QuoteCar): Promise < ReturnDTO > {
    return this.app.doWhatever(carDetails, '/car/validateConductionNumberFormat').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getSubagents(): Promise < ReturnDTO > {
    return this.app.doWhatever(null, '/car/getSubagents').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

}