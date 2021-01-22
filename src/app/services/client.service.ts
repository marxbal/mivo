import {
  Injectable
} from '@angular/core';
import {
  AppService
} from './app.service';
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  PageFilter
} from '../objects/PageFilter';

@Injectable()
export class ClientService {

  constructor(private app: AppService) {}

  async getClientDetailsList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/client/clientDetails').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}