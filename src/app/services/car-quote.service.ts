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
  QuoteCar
} from '../objects/QuoteCar';
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
  FormGroup,
  Validators
} from '@angular/forms';

@Injectable()
export class CarQuoteServices {

  //modal reference
  modalRef: BsModalRef;

  constructor(private app: AppService,
    private us: UtilityService,
    public bms: BsModalService,
    private router: Router
  ) {}

  async checkRoadAssist(carDetails: QuoteCar): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quote/checkRoadAssist').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async getCoverageByProduct(carDetails: QuoteCar): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quote/getCoverageByProduct').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async issueQuote(carDetails: QuoteCar): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quote/issueQuote').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  async issuePolicy(carDetails: QuoteCar): Promise < ReturnDTO > {
    return this.app.post(carDetails, '/quote/issuePolicy').then(ReturnDTO => ReturnDTO as ReturnDTO);
  }

  printQuote(quotationNumber: string) {
    const documentPrintingDetails = new DocumentPrinting();
    documentPrintingDetails.quotationNumber = quotationNumber;
    documentPrintingDetails.documentType = "Q";

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
      Globals.setPage(page.ISS.CAR);
      Globals.setLoadNumber(quotationNumber);
      Globals.setLoadQuotation(true);
      this.router.navigate(['/reload']);
    }, 500);
  }

  activateCTPL(form: FormGroup, carDetails: QuoteCar, selectedCoverage ? : boolean) {
    //if selected product is CTPL
    const isCTPL = carDetails.productList == 10001 || selectedCoverage;
    var registrationType = form.get('registrationType');
    var cocNumber = form.get('cocNumber');
    var authNumber = form.get('authNumber');

    Utility.updateValidator(registrationType, isCTPL ? Validators.required : null);
    Utility.updateValidator(cocNumber, isCTPL ? Validators.required : null);
    Utility.updateValidator(authNumber, isCTPL ? Validators.required : null);
  }
}