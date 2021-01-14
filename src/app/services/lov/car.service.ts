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

@Injectable()
export class CarLOVServices {
  constructor(private lov: LovService) {}

  async getMakeList(): Promise < any[] > {
    const dto = new LOV('A2100400', '3', 'COD_CIA~1');
    return this.lov.getIntLOV(dto, 'COD_MARCA').then(lovs => lovs as any[]);
  }

  async getModelList(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'A2100410',
      '4',
      '|COD_MARCA~' + carDetails.make +
      '|NUM_COTIZACION~1|COD_CIA~1');
    return this.lov.getIntLOV(dto, 'COD_MODELO').then(lovs => lovs as any[]);
  }

  async getVehicleTypeList(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'A2100100',
      '2',
      '|COD_MARCA~' + carDetails.make +
      '|COD_MODELO~' + carDetails.model +
      '|NUM_COTIZACION~1|COD_CIA~1');
    return this.lov.getIntLOV(dto, 'COD_TIP_VEHI').then(lovs => lovs as any[]);
  }

  async getModelYearList(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'A2100430',
      '4',
      '|COD_MARCA~' + carDetails.make +
      '|COD_MODELO~' + carDetails.model +
      '|COD_TIP_VEHI~' + carDetails.vehicleType +
      '|NUM_COTIZACION~1|COD_CIA~1');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getSubModelList(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'A2100420',
      '4',
      '|COD_MARCA~' + carDetails.make +
      '|COD_MODELO~' + carDetails.model +
      '|COD_TIP_VEHI~' + carDetails.vehicleType +
      '|ANIO_SUB_MODELO~' + carDetails.modelYear +
      '|NUM_COTIZACION~1|COD_CIA~1');
    return this.lov.getIntLOV(dto, 'COD_SUB_MODELO').then(lovs => lovs as any[]);
  }

  async getTypeOfUseList(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'A2100200',
      '4',
      '|COD_MARCA~' + carDetails.make +
      '|COD_MODELO~' + carDetails.model +
      '|COD_TIP_VEHI~' + carDetails.vehicleType +
      '|ANIO_SUB_MODELO~' + carDetails.modelYear +
      '|NUM_COTIZACION~1|COD_CIA~1');
    return this.lov.getIntLOV(dto, 'COD_USO_VEHI').then(lovs => lovs as any[]);
  }

  async getColor(): Promise < any[] > {
    const dto = new LOV('A2100800', '1', '');
    return this.lov.getIntLOV(dto, 'COD_COLOR').then(lovs => lovs as any[]);
  }

  async getAreaOfUsage(carDetails: any): Promise < any[] > {
    const dto = new LOV('G2990006', '4', 'COD_RAMO~' + carDetails.subline);
    return this.lov.getIntLOV(dto, 'COD_VALOR').then(lovs => lovs as any[]);
  }

  async getAccessoryList(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'A2100601',
      '2',
      '|COD_CIA~1' +
      '|cod_tip_vehi~' + carDetails.vehicleType +
      '|fec_validez~' + carDetails.sublineEffectivityDate);
    return this.lov.getIntLOV(dto, 'COD_ACCESORIO').then(lovs => lovs as any[]);
  }

  async getClassification(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIP_VEHI_PESO',
      '999');
    return this.lov.getIntOptionList(dto, 'TIP_VEHI_PESO').then(lovs => lovs as any[]);
  }

  async getCoverageArea(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'COD_AREA_COVER',
      '999');
    return this.lov.getIntOptionList(dto, 'COD_AREA_COVER').then(lovs => lovs as any[]);
  }

  async getMortgageClause(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIP_MORT_CLAUSE',
      '999');
    return this.lov.getIntOptionList(dto, 'TIP_MORT_CLAUSE').then(lovs => lovs as any[]);
  }

  async getInspectionAssessment(): Promise < any[] > {
    const dto = new LOV(
      'G1010031',
      '46',
      '|cod_idioma~EN');
    return this.lov.getIntLOV(dto, 'COD_VALOR').then(lovs => lovs as any[]);
  }

  async getPaymentPlan(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'A1001402',
      '6',
      '|COD_CIA~1' +
      '|cod_ramo~' + carDetails.subline +
      '|cod_mon~1' +
      '|fec_validez~' + carDetails.sublineEffectivityDate +
      '|cod_nivel1~|cod_nivel2~|cod_nivel3~|tip_docum~|cod_docum~');
    return this.lov.getIntLOV(dto, 'COD_FRACC_PAGO').then(lovs => lovs as any[]);
  }

  async getProduct(carDetails: any): Promise < any[] > {
    const dto = new LOV(
      'G2990004',
      '12', // 18 if client 12 if not
      '|COD_CIA~1' +
      '|COD_RAMO~' + carDetails.subline);
    return this.lov.getIntLOV(dto, 'COD_MODALIDAD').then(lovs => lovs as any[]);
  }

  async getSumInsuredPerPassenger(subline: number): Promise < any[] > {
    const dto = new LOV(
      'G2990006',
      '3',
      '|COD_RAMO~' + subline);
    return this.lov.getIntLOV(dto, 'COD_VALOR').then(lovs => lovs as any[]);
  }

  async getRegistrationType(): Promise < any[] > {
    const dto = new LOV(
      'G1010031',
      '58',
      '');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getMVType(): Promise < any[] > {
    const dto = new LOV(
      'G1010031',
      '59',
      '');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  //get policy holder prefix
  async getPHPrefix(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIP_ASEG_PREF',
      '999');
    return this.lov.getIntOptionList(dto, 'TIP_ASEG_PREF').then(lovs => lovs as any[]);
  }
  
  //get policy holder separator
  async getPHSeparator(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIP_ASEG_SEP_LOV',
      '999');
    return this.lov.getIntOptionList(dto, 'TIP_ASEG_SEP_LOV').then(lovs => lovs as any[]);
  }
}