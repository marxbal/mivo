import {
  Injectable
} from '@angular/core';
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
  Router
} from '@angular/router';

@Injectable()
export class PrintingService {

  //modal reference
  modalRef: BsModalRef;

  constructor(private us: UtilityService,
    public bms: BsModalService,
    private router: Router
  ) {}

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

  proceedToIssuance(quotationNumber: string, page: string) {
    Utility.scroll('topDiv');
    setTimeout(() => {
      // Globals.setPage(page.ISS.ACC);
      Globals.setPage(page);
      Globals.setLoadNumber(quotationNumber);
      Globals.setLoadQuotation(true);
      this.router.navigate(['/reload']);
    }, 500);
  }
}