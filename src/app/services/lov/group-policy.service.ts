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
  GroupPolicy
} from '../../objects/GroupPolicy';
import {
  AuthenticationService
} from '../authentication.service';

@Injectable()
export class GroupPolicyLOVServices {

  constructor(
    private lov: LovService,
    private auths: AuthenticationService) {}

  user = this.auths.currentUserValue;

  async getCommercialStructure(): Promise < any[] > {
    const dto = new LOV(
      'A1000710',
      '2',
      'COD_CIA~' + this.user.companyCode +
      '|COD_AGT~' + this.user.agentCode);
    return this.lov.getIntLOV(dto, 'COD_NIVEL3').then(lovs => lovs as any[]);
  }

  async getGroupPolicy(subline: number): Promise < any[] > {
    const dto = new LOV(
      'A2000010',
      '4',
      'COD_CIA~' + this.user.companyCode +
      '|COD_AGT~' + this.user.agentCode +
      '|COD_RAMO~' + subline);
    return this.lov.getIntLOV(dto, 'NUM_POLIZA').then(lovs => lovs as any[]);
  }

  async getContract(subline: number, groupPolicy: GroupPolicy): Promise < any[] > {
    const dto = new LOV(
      'G2990001',
      '7',
      'COD_CIA~' + this.user.companyCode +
      '|COD_AGT~' + this.user.agentCode +
      '|COD_RAMO~' + subline +
      '|NUM_POLIZA_GRUPO~' + groupPolicy.groupPolicy);
    return this.lov.getIntLOV(dto, 'NUM_CONTRATO').then(lovs => lovs as any[]);
  }

  async getSubContract(subline: number, groupPolicy: GroupPolicy): Promise < any[] > {
    const dto = new LOV(
      'G2990022',
      '2',
      'COD_CIA~' + this.user.companyCode +
      '|COD_AGT~' + this.user.agentCode +
      '|COD_RAMO~' + subline +
      '|NUM_CONTRATO~' + groupPolicy.contract);
    return this.lov.getIntLOV(dto, 'NUM_SUBCONTRATO').then(lovs => lovs as any[]);
  }
}
