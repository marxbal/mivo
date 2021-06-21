import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { UtilitiesQueryFilter } from '../../app/objects/UtilitiesQueryFilter';
import { ReturnDTO } from '../../app/objects/ReturnDTO';

@Injectable({
    providedIn: 'root'
})
export class UtilityQueryService {

  constructor(private app: AppService) { }

  async getSearchResult(filter: UtilitiesQueryFilter): Promise <ReturnDTO> {
    return this.app.post(filter, '/InquiryController/EncryptParam').then( data => data as ReturnDTO);
  }
}
