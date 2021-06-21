import {
  Injectable
} from '@angular/core';
import {
  AppService
} from './app.service';
import {
  ReturnDTO
} from '../objects/ReturnDTO';

@Injectable()
export class DashboardService {
  constructor(private app: AppService) {}

  async getForeignExchange(): Promise < ReturnDTO > {
    return this.app.get('/dashboard/getForeignExchange').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getDashboardInfo(): Promise < ReturnDTO > {
    return this.app.get('/dashboard/getDashboardInfo').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getAnnouncement(): Promise < ReturnDTO > {
    return this.app.get('/dashboard/getAnnouncement').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

}
