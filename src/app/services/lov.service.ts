import {
  Injectable
} from '@angular/core';
import {
  AppService
} from '../services/app.service';
import {
  LOV
} from '../objects/LOV';
import {
  OptionList
} from '../objects/OptionList';
import {
  Utility
} from '../utils/utility';

@Injectable()
export class LovService {
  constructor(private app: AppService) {}

  async getLOV(dto: LOV): Promise < any[] > {
    return this.app.post(dto, '/getLOV').then(objArr => objArr as any[]);
  }

  async getIntLOV(dto: LOV, param: string): Promise < any[] > {
    return Utility.parseIntArray(await this.app.post(dto, '/getLOV').then(objArr => objArr as any[]), param);
  }

  async getOptionList(dto: OptionList): Promise < any[] > {
    return this.app.post(dto, '/getOptionList').then(objArr => objArr as any[]);
  }

  async getIntOptionList(dto: OptionList, param: string): Promise < any[] > {
    return Utility.parseIntArray(await this.app.post(dto, '/getOptionList').then(objArr => objArr as any[]), param);
  }

  async getConfigList(): Promise < any[] > {
    return this.app.get('/getConfigList').then(objArr => objArr as any[]);
  }
}
