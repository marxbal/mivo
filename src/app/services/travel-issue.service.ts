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
  DocumentPrinting
} from '../objects/DocumentPrinting';
import {
  UtilityService
} from './utility.service';
import {
  Globals
} from '../utils/global';
import {
  Utility
} from '../utils/utility';
import {
  BsModalService,
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  page
} from '../constants/page';
import {
  Router
} from '@angular/router';
import {
  Travel
} from '../objects/Travel';

@Injectable()
export class TravelIssueServices {

  //modal reference
  modalRef: BsModalRef;

  constructor(private app: AppService,
    private us: UtilityService,
    public bms: BsModalService,
    private router: Router
  ) {}

  async issueQuote(travelDetails: Travel): Promise < ReturnDTO > {
    return this.app.post(travelDetails, '/travel/issue/issueQuote').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async savePolicy(travelDetails: Travel): Promise < ReturnDTO > {
    return this.app.post(travelDetails, '/travel/issue/savePolicy').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async postPolicy(travelDetails: Travel): Promise < ReturnDTO > {
    return this.app.post(travelDetails, '/travel/issue/postPolicy').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async loadQuotation(quotationNumber: string): Promise < ReturnDTO > {
    return this.app.post({quotationNumber}, '/travel/issue/loadQuotation').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  printQuote(quotationNumber: string) {
    this.printDoc(quotationNumber, "Q");
  }

  printPolicy(policyNumber: string) {
    this.printDoc(policyNumber, "P");
  }

  printDoc(number: string, type: string) {
    const documentPrintingDetails = new DocumentPrinting();
    if (type == "P") {
      documentPrintingDetails.policyNumber = number;
    } else {
      documentPrintingDetails.quotationNumber = number;
    }

    documentPrintingDetails.documentType = type;

    this.us.validatePrinting(documentPrintingDetails).then((res) => {
      if (res.status) {
        var ext = res.obj;
        this.us.printDocument(ext.toString()).subscribe(data => {
          if (data != null) {
            window.open(URL.createObjectURL(data));
          }
        });
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

  proceedToIssuance(quotationNumber: string) {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page.ISS.TRA);
      Globals.setLoadNumber(quotationNumber);
      Globals.setLoadQuotation(true);
      this.router.navigate(['/reload']);
    }, 500);
  }
}