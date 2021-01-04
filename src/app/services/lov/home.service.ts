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
  Home
} from 'src/app/objects/Home';

@Injectable()
export class HomeLOVServices {
  constructor(private lov: LovService) {}

  async getHomeBusinessLine(): Promise < any[] > {
    const dto = new LOV('A1001800', '92', 'cod_cia~1|cod_sector~2');
    return this.lov.getIntLOV(dto, "COD_RAMO").then(lovs => lovs as any[]);
  }

  async getPaymentPlan(home: Home): Promise < any[] > {
    const dto = new LOV('A1001402',
      '6', '|cod_ramo~' + home.subline +
      '|cod_mon~' + home.currency +
      '|fec_validez~' + home.sublineEffectivityDate +
      '|cod_nivel1~|cod_nivel2~|cod_nivel3~|tip_docum~|cod_docum~|COD_CIA~1');
    return this.lov.getIntLOV(dto, "COD_FRACC_PAGO").then(lovs => lovs as any[]);
  }

  async getDistrict(): Promise < any[] > {
    const dto = new LOV('A2009101_MPH', '1', '');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getBlockNumber(district : string): Promise < any[] > {
    const dto = new LOV('A2009101_MPH', '3', 'COD_CIA~1|DVCOD_DISTRICT~' + district);
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getCurrency(home: Home): Promise < any[] > {
    const dto = new LOV('G2990005', '1', 'cod_cia~1|cod_ramo~' + home.subline +
      '|fec_validez~' + home.sublineEffectivityDate);
    return this.lov.getIntLOV(dto, "COD_MON").then(lovs => lovs as any[]);
  }

  async getRelatedStructureProperty(home: Home): Promise < any[] > {
    const dto = new LOV('G2990006', '5', 'cod_campo~TXT_DESCRIPTION_PROPERTY_2156' +
      '|cod_cia~1|cod_ramo~' + home.subline +
      '|fec_validez~' + home.sublineEffectivityDate +
      '|DVCOD_MODALIDAD~20001');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getRelatedContentProperty(home: Home): Promise < any[] > {
    const dto = new LOV('G2990006', '5', 'cod_campo~TXT_DESCRIPTION_PROPERTY_2356' +
      '|cod_cia~1|cod_ramo~' + home.subline +
      '|fec_validez~' + home.sublineEffectivityDate +
      '|DVCOD_MODALIDAD~20001');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getProduct(home: Home): Promise < any[] > {
    const dto = new LOV('G2990004', '10', 'cod_cia~1|cod_ramo~' + home.subline);
    return this.lov.getIntLOV(dto, "COD_MODALIDAD").then(lovs => lovs as any[]);
  }
}
