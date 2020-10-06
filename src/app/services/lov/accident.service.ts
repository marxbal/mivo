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
  Accident
} from 'src/app/objects/Accident';

@Injectable()
export class AccidentLOVServices {
  constructor(private lov: LovService) {}

  async getSubline(): Promise < any[] > {
    const dto = new LOV('A1001800', '93', '');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getOccupationalClass(): Promise < any[] > {
    const dto = new LOV(
      'G2990006',
      '1',
      '|cod_ramo~323' +
      '|cod_modalidad~99999' +
      '|cod_campo~COD_OCCUPATIONAL_CLASS' +
      '|fec_validez~01012016');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getPaymentPlan(accidentDetails: Accident): Promise < any[] > {
    const dto = new LOV(
      'A1001402',
      '6',
      '|COD_CIA~1' +
      '|cod_ramo~' + accidentDetails.subline +
      '|cod_mon~1' +
      '|fec_validez~' + accidentDetails.sublineEffectivityDate +
      '|cod_nivel1~|cod_nivel2~|cod_nivel3~|tip_docum~|cod_docum~');
    return this.lov.getIntLOV(dto, 'COD_FRACC_PAGO').then(lovs => lovs as any[]);
  }

  async getProduct(accidentDetails: Accident): Promise < any[] > {
    const dto = new LOV(
      'G2990004',
      '16',
      '|cod_cia~1' +
      '|cod_ramo~' + accidentDetails.subline);
    return this.lov.getIntLOV(dto, 'COD_MODALIDAD').then(lovs => lovs as any[]);
  }
}
