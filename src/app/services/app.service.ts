import {
  Injectable
} from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import {
  API_URL
} from '../constants/app.constant';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

import {
  BsModalService,
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  Utility
} from '../utils/utility';

@Injectable()
export class AppService {
  modalRef: BsModalRef;
  constructor(
    private http: HttpClient,
    private modalService: BsModalService) {}

    // httpOptions = {
    //   headers: new HttpHeaders({ 
    //     'Access-Control-Allow-Origin':'*',
    //     'Access-Control-Allow-Method':'*',
    //     'Access-Control-Allow-Headers' : "Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization",
    //     'Accept': '*/*',
    //     'Content-Type' : 'application/json'
    //   })
    // };

  async post(param: any, endpoint: string): Promise < any > {
    return this.http.post(API_URL + endpoint, param)
      .toPromise()
      .then(response => response)
      // .catch(err => console.log(err));
      .catch(err => this.modalRef = Utility.showError(this.modalService, err.message));
  }

  async get(endpoint: string): Promise < any > {
    return this.http.get(API_URL + endpoint)
      .toPromise()
      .then(response => response)
      // .catch(err => console.log(err));
      .catch(err => this.modalRef = Utility.showError(this.modalService, err.message));
  }
}
