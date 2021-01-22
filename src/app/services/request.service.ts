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
import {
  PageFilter
} from '../objects/PageFilter';

@Injectable()
export class RequestService {

  constructor(private app: AppService) {}

  async request(requestDetails: RequestDetails, type: String): Promise < ReturnDTO > {
    let url = '/request/endorsement';
    if (type == 'R') {
      url = '/request/renewal';
    } else if (type == 'U') {
      url = '/request/underwriting';
    }

    return this.app.post(requestDetails, url).then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async policy(files: File[], requestDetails: RequestDetails): Promise < ReturnDTO > {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    formData.append("request", requestDetails.toString());

    for (let entry in requestDetails) {
      if (requestDetails[entry] != undefined) {
        formData.append(entry, requestDetails[entry]);
      }
    }

    return this.app.post(formData, '/request/policy').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getList(pageFilter: PageFilter): Promise < ReturnDTO > {
    return this.app.post(pageFilter, '/request/list').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getMessageList(requestId: String): Promise < ReturnDTO > {
    return this.app.post(requestId, '/request/messageList').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async reply(requestDetails: RequestDetails): Promise < ReturnDTO > {
    return this.app.post(requestDetails, '/request/reply').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}