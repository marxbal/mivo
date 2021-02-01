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

@Injectable()
export class GroupPolicyLOVServices {

  constructor(private lov: LovService) {}

  async getCommercialStructure(companyCode: number, agentCode: number): Promise < any[] > {
    const dto = new LOV(
      'A1000710',
      '2',
      'COD_CIA~' + companyCode +
      '|COD_AGT~' + agentCode);
    return this.lov.getIntLOV(dto, 'COD_NIVEL3').then(lovs => lovs as any[]);
  }

  async getGroupPolicy(subline: number, companyCode: number, agentCode: number): Promise < any[] > {
    const dto = new LOV(
      'A2000010',
      '4',
      'COD_CIA~' + companyCode +
      '|COD_AGT~' + agentCode +
      '|COD_RAMO~' + subline);
    return this.lov.getIntLOV(dto, 'NUM_POLIZA').then(lovs => lovs as any[]);
  }

  async getContract(subline: number, groupPolicy: GroupPolicy, companyCode: number, agentCode: number): Promise < any[] > {
    const dto = new LOV(
      'G2990001',
      '7',
      'COD_CIA~' + companyCode +
      '|COD_AGT~' + agentCode +
      '|COD_RAMO~' + subline +
      '|NUM_POLIZA_GRUPO~' + groupPolicy.groupPolicy);
    return this.lov.getIntLOV(dto, 'NUM_CONTRATO').then(lovs => lovs as any[]);
  }

  async getSubContract(subline: number, groupPolicy: GroupPolicy, companyCode: number, agentCode: number): Promise < any[] > {
    const dto = new LOV(
      'G2990022',
      '2',
      'COD_CIA~' + companyCode +
      '|COD_AGT~' + agentCode +
      '|COD_RAMO~' + subline +
      '|NUM_CONTRATO~' + groupPolicy.contract);
    return this.lov.getIntLOV(dto, 'NUM_SUBCONTRATO').then(lovs => lovs as any[]);
  }
}