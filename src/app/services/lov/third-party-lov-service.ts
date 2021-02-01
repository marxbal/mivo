import {
  Injectable
} from '@angular/core';
import {
  LovService
} from '../lov.service';
import {
  LOV
} from '../../objects/LOV';
import {
  OptionList
} from 'src/app/objects/OptionList';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  AuthenticationService
} from '../authentication.service';

@Injectable()
export class ThirdPartyLOVServices {
  constructor(
    private lov: LovService,
    private auths: AuthenticationService) {}

  user = this.auths.currentUserValue;

  async getDocumentType(): Promise < any[] > {
    const dto = new LOV(
      'A1002300',
      '3',
      '|COD_CIA~1');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getPrefix(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIP_PREFIJO_NOMBRE',
      '999');
    return this.lov.getIntOptionList(dto, 'TIP_PREFIJO_NOMBRE').then(lovs => lovs as any[]);
  }

  async getSuffix(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIPO_SUFIJO_NOMBRE',
      '999');
    return this.lov.getIntOptionList(dto, 'TIPO_SUFIJO_NOMBRE').then(lovs => lovs as any[]);
  }

  async getCorrespondenceType(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIP_ETIQUETA',
      '999');
    return this.lov.getIntOptionList(dto, 'TIP_ETIQUETA').then(lovs => lovs as any[]);
  }

  async getCountry(): Promise < any[] > {
    const dto = new LOV(
      'A1000101',
      '1',
      '');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getState(thirdParty: PolicyHolder): Promise < any[] > {
    const dto = new LOV(
      'A1000104',
      '5',
      'COD_PAIS~' + thirdParty.country);
    return this.lov.getIntLOV(dto, 'COD_ESTADO').then(lovs => lovs as any[]);
  }

  async getProvince(thirdParty: PolicyHolder): Promise < any[] > {
    const dto = new LOV(
      'A1000100',
      '6',
      'COD_PAIS~' + thirdParty.country +
      '|COD_ESTADO~' + thirdParty.state);
    return this.lov.getIntLOV(dto, 'COD_PROV').then(lovs => lovs as any[]);
  }

  async getCity(thirdParty: PolicyHolder): Promise < any[] > {
    const dto = new LOV(
      'A1000102',
      '3',
      'COD_PAIS~' + thirdParty.country +
      '|COD_PROV~' + thirdParty.province);
    return this.lov.getIntLOV(dto, 'COD_LOCALIDAD').then(lovs => lovs as any[]);
  }

  async getZipCode(thirdParty: PolicyHolder): Promise < any[] > {
    const dto = new LOV(
      'A1000103',
      '3',
      'COD_PAIS~' + thirdParty.country +
      '|COD_ESTADO~' + thirdParty.state +
      '|COD_PROV~' + thirdParty.province +
      '|COD_LOCALIDAD~' + thirdParty.city);
    return this.lov.getIntLOV(dto, 'COD_POSTAL').then(lovs => lovs as any[]);
  }

  async getNationality(): Promise < any[] > {
    const dto = new LOV(
      'A1000101',
      '1',
      '');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }

  async getPost(): Promise < any[] > {
    const dto = new LOV(
      'G2990022',
      '2',
      'COD_CIA~' + this.user.companyCode +
      '|COD_AGT~' + this.user.agentCode);
    return this.lov.getIntLOV(dto, 'NUM_SUBCONTRATO').then(lovs => lovs as any[]);
  }

  async getTypeOfBusiness(): Promise < any[] > {
    const dto = new LOV(
      'G2990022',
      '2',
      'COD_CIA~' + this.user.companyCode +
      '|COD_AGT~' + this.user.agentCode);
    return this.lov.getIntLOV(dto, 'NUM_SUBCONTRATO').then(lovs => lovs as any[]);
  }

  async getMaritalStatus(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'COD_EST_CIVIL',
      '999');
    return this.lov.getOptionList(dto).then(lovs => lovs as any[]);
  }

  //same with occupation
  async getProfession(): Promise < any[] > {
    const dto = new LOV(
      'G1000100',
      '2',
      '');
    return this.lov.getIntLOV(dto, 'COD_PROFESION').then(lovs => lovs as any[]);
  }

  async getType(): Promise < any[] > {
    const dto = new OptionList(
      'EN',
      'TIP_NACIONALIDAD',
      '999');
    return this.lov.getIntOptionList(dto, 'COD_PAIS').then(lovs => lovs as any[]);
  }

  async getLanguage(): Promise < any[] > {
    const dto = new LOV(
      'G1010010',
      '1',
      '');
    return this.lov.getLOV(dto).then(lovs => lovs as any[]);
  }
}