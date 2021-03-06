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
import {
  ReceiptPrinting
} from '../objects/ReceiptPrinting';

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

  downloadReceipt(receipt: ReceiptPrinting) {
    return this.http.post(
      API_URL + '/utility/downloadReceipt',
      receipt, {
        responseType: 'blob'
      }).map((res: Blob) => {
        return new Blob([res], {
          type: 'application/pdf'
        });
    });
  }

  async validateReceiptPrinting(receipt: ReceiptPrinting): Promise < ReturnDTO > {
    return this.app.post(receipt, '/utility/validateReceiptPrinting').then(ReturnDTO => ReturnDTO as ReturnDTO);
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

  async changePassword(oldPass: String, newPass: String): Promise < ReturnDTO > {
    return this.app.post({
      oldPass,
      newPass
    }, '/utility/changePassword').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }
}
