import {
  Injectable
} from '@angular/core';
import {
  LovService
} from '../../services/lov.service';
import {
  LOV
} from '../../objects/LOV';
import {
  OptionList
} from '../../objects/OptionList';

@Injectable()
export class TravelLOVServices {
  constructor(private lov: LovService) {}

  async getCurrencyList() : Promise < any[] > {
    const dto = new LOV('G2990005', '1', 'cod_cia~1|cod_ramo~322|fec_validez~14092015');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getCountryList(travelDetails: any) : Promise < any[] > {
    const dto = new LOV(
      'A1000101',
      '3',
      '|cod_mon~' + travelDetails.currency +
      '|cod_idioma~EN|COD_CIA~1');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getTravelPackage() : Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TRAVEL_PACK',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  async getTypeOfCoverage() : Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'INSURANCE_COVERAGE',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  async getPurposeOfTrip() : Promise < any[] > {
    const dto = new LOV(
      'TAVIA001',
      '1',
      '|cod_cia~1' +
      '|cod_mon~1' +
      '|cod_ramo~322' +
      '|cod_campo~PURPOSE_TRIP');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getAgeRange() : Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'AGE_RANGE',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

}
