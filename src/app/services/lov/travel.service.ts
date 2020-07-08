import {
  Injectable
} from '@angular/core';
import {
  LovService
} from '.././lov.service';
import {
  LOV
} from '../../objects/LOV';
import {
  OptionList
} from '../../objects/OptionList';
import { Travel } from 'src/app/objects/Travel';

@Injectable()
export class TravelLOVServices {
  constructor(private lov: LovService) {}

  async getCurrencyList(): Promise < any[] > {
    const dto = new LOV(
      'G2990005',
      '1',
      'cod_cia~1|cod_ramo~380|fec_validez~01012020');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getCountryList(travelDetails: Travel): Promise < any[] > {
    const dto = new LOV(
      'A1000101',
      '3',
      '|cod_mon~' + travelDetails.currency +
      '|cod_idioma~EN|COD_CIA~1');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getTravelPackage(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TRAVEL_PACK',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  async getTypeOfCoverage(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'INSURANCE_COVERAGE',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  async getPurposeOfTrip(): Promise < any[] > {
    const dto = new LOV(
      'TAVIA001',
      '1',
      '|cod_cia~1' +
      '|cod_mon~1' +
      '|cod_ramo~322' +
      '|cod_campo~PURPOSE_TRIP');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getAgeRange(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'AGE_RANGE',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  async getRelationship(): Promise < any[] > {
    const dto = new LOV(
      'G1010031',
      '82',
      '|cod_campo~RELATIONSHIP' +
      '|cod_idioma~EN' +
      '|cod_ramo~380');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getCoverageOption(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'COVERAGE_OPTIONS',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  async getInsuranceCoverage(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'INSURANCE_COVERAGE',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  async getExpensesCoverage(travelDetails: Travel): Promise < any[] > {
    const dto = new LOV(
      'TAGEN001',
      '2',
      '|cod_cia~1' +
      '|cod_mon~' + travelDetails.currency +
      '|cod_ramo~380' + 
      '|DVTRAVEL_PACK~' + travelDetails.travelPackage);
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }
}
