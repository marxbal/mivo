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

  async upload(files: File[], requestDetails: RequestDetails): Promise < ReturnDTO > {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files[]", file);
    });

    for (let entry in requestDetails) {
      if (requestDetails[entry] != undefined) {
        formData.append(entry, requestDetails[entry]);
      }
  }
    
    return this.app.post(formData, '/request/policyRequest').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}