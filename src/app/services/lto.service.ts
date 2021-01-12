import {
  Injectable
} from '@angular/core';
import 'rxjs/add/operator/map';
import {
  AppService
} from './app.service'
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  LTODetails
} from '../objects/LTODetails';

@Injectable()
export class LTOService {
  constructor(
    private app: AppService) {}

  async authenticateCOCRegistration(ltoDetails: LTODetails): Promise < ReturnDTO > {
    return this.app.post(ltoDetails, '/lto/authenticateCOCRegistration').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}