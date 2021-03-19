import {
  Injectable
} from '@angular/core';
import 'rxjs/add/operator/map';
import {
  HttpClient
} from '@angular/common/http';
import {
  API_URL
} from '../constants/app.constant';
import {
  DocumentPrinting
} from '../objects/DocumentPrinting';
import {
  AppService
} from '../services/app.service'
import {
  ReturnDTO
} from '../objects/ReturnDTO';
import {
  RenewalPrinting
} from '../objects/RenewalPrinting';

@Injectable()
export class UtilityService {
  constructor(
    private app: AppService,
    private http: HttpClient) {}

  printDocument(extension: String) {
    return this.http.post(
      API_URL + '/utility/downloadFile',
      extension, {
        responseType: 'blob'
      }).map((res: Blob) => {
      return new Blob([res], {
        type: 'application/pdf'
      });
    });
  }

  downloadRenewalPolicy(print: RenewalPrinting) {
    return this.http.post(
      API_URL + '/utility/downloadRenewalPolicy',
      print, {
        responseType: 'blob'
      }).map((res: Blob) => {
      return new Blob([res], {
        type: 'application/pdf'
      });
    });
  }

  async validatePrinting(documentPritingDetails: DocumentPrinting): Promise < ReturnDTO > {
    return this.app.post(documentPritingDetails, '/utility/validatePrinting').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getDateRecord(): Promise < ReturnDTO > {
    return this.app.get('/utility/getDateRecord').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getEndorsementNumber(documentPritingDetails: DocumentPrinting): Promise < ReturnDTO > {
    return this.app.post(documentPritingDetails, '/utility/getEndorsementNumber').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async changePassword(oldPassword: String, newPassword: String): Promise < ReturnDTO > {
    return this.app.post({oldPassword, newPassword}, '/utility/changePassword').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}
