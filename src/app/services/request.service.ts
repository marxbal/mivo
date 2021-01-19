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
  RequestDetails
} from '../objects/RequestDetails';

@Injectable()
export class RequestService {

  constructor(private app: AppService) {}

  async request(requestDetails: RequestDetails): Promise < ReturnDTO > {
    return this.app.post(requestDetails, '/request').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}