import {
  Component,
  OnInit,
  Input,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  BsModalService,
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  Utility
} from '../../utils/utility';
import {
  AccidentListObject
} from 'src/app/objects/LOV/accidentList';
import {
  QuickQuoteService
} from '../../services/quickquote.service';
import {
  AccidentLOVServices
} from '../../services/lov/accident.service'
import {
  Accident
} from 'src/app/objects/Accident';

export interface QuickQuoteResultDTO {
  label: string;
  premium: string;
  product: number;
  isHeader: boolean;
  exclude: boolean;
}

@Component({
  selector: 'app-quick-quotation-accident',
  templateUrl: './quick-quotation-accident.component.html',
  styleUrls: ['./quick-quotation-accident.component.css']
})

export class QuickQuotationAccidentComponent implements OnInit, AfterViewChecked {
  accidentDetails = new Accident();
  LOV = new AccidentListObject();
  quickQuoteForm: FormGroup;

  showDetails: boolean = false;
  showSPADetails: boolean = false;
  showHCBIDetails: boolean = false;

  displayedColumns: string[] = ['label', 'premium'];

  accidentData: Array < QuickQuoteResultDTO > = [];
  coverageData: Array < QuickQuoteResultDTO > = [];
  coverageList: any[];

  //flag to display product comparison
  showProductComparison: boolean = false;
  //flag to display product coverage
  showProductCoverage: boolean = false;
  //modal reference
  modalRef: BsModalRef;

  constructor(
    private fb: FormBuilder,
    private qqs: QuickQuoteService,
    private als: AccidentLOVServices,
    private changeDetector: ChangeDetectorRef,
    private bms: BsModalService
  ) {
    this.createQuickQuoteForm();
    this.setValidations();
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    var _this = this;
    this.als.getSubline().then(res => {
      _this.LOV.sublineLOV = res;
    });

    this.getAge();
    this.getChildNumber();
  }

  createQuickQuoteForm() {
    this.quickQuoteForm = this.fb.group({
      subline: ['', Validators.required],
      occupationalClass: ['', Validators.required],
      disablementValue: ['', [Validators.required, Validators.max(2000000), Validators.min(10000)]],
      primaryInsuredAge: ['', Validators.required],
      cbSpouseAge: [null],
      spouseAge: ['', Validators.required],
      cbChildNumber: [null],
      childNumber: ['', Validators.required]
    });
  }

  setValidations() {
    var _this = this;
    var occupationalClass = this.quickQuoteForm.get('occupationalClass');
    var disablementValue = this.quickQuoteForm.get('disablementValue');
    var primaryInsuredAge = this.quickQuoteForm.get('primaryInsuredAge');
    var spouseAge = this.quickQuoteForm.get('spouseAge');
    var cbSpouseAge = this.quickQuoteForm.get('cbSpouseAge');
    var childNumber = this.quickQuoteForm.get('childNumber');
    var cbChildNumber = this.quickQuoteForm.get('cbChildNumber');

    this.quickQuoteForm.get('subline').valueChanges.subscribe(subline => {
      this.accidentDetails.subline = subline;
      this.showDetails = false;
      this.showSPADetails = false;
      this.showHCBIDetails = false;

      //removing required validation
      Utility.updateValidator(occupationalClass, null);
      Utility.updateValidator(disablementValue, null);
      Utility.updateValidator(primaryInsuredAge, null);
      Utility.updateValidator(spouseAge, null);
      Utility.updateValidator(childNumber, null);

      if (subline == 323) { //standard personal accident
        this.showDetails = true;
        this.showSPADetails = true;
        Utility.updateValidator(occupationalClass, [Validators.required]);
        Utility.updateValidator(disablementValue, [Validators.required, Validators.max(2000000), Validators.min(10000)]);
        this.als.getOccupationalClass(this.accidentDetails).then(res => {
          _this.LOV.occupationalClassLOV = res;
        });
      } else if (subline == 326) { //hospital cash benefit
        this.showDetails = true;
        this.showHCBIDetails = true;
        Utility.updateValidator(primaryInsuredAge, [Validators.required]);
        Utility.updateValidator(spouseAge, cbSpouseAge.value === true ? [Validators.required] : null);
        Utility.updateValidator(childNumber, cbChildNumber.value === true ? [Validators.required] : null);
      }
    });

    cbSpouseAge.valueChanges.subscribe(checked => {
      this.accidentDetails.spouseAge = Utility.setNull(checked, this.accidentDetails.spouseAge);
      Utility.updateValidator(spouseAge, checked === true ? [Validators.required] : null);
    });

    cbChildNumber.valueChanges.subscribe(checked => {
      this.accidentDetails.childNumber = Utility.setNull(checked, this.accidentDetails.childNumber);
      Utility.updateValidator(childNumber, checked === true ? [Validators.required] : null);
    });
  }

  createQuickQuoteData(quickQuoteDetails: any[], productList: any[]) {
    this.accidentData = [];
    productList.forEach(a => {
      quickQuoteDetails.forEach(b => {
        if (a.numSimulacion === b.numSimulacion) {
          var obj = {} as QuickQuoteResultDTO;
          obj.label = a.nomSimulacion;
          obj.premium = b.impRecibo;
          obj.product = b.numSimulacion;
          this.accidentData.push(obj);
        }
      });
    });
  }

  getAge() {
    this.LOV.ageLOV = [{
      value: 20,
      name: "18-29"
    }, {
      value: 32,
      name: "30-29"
    }, {
      value: 42,
      name: "40-49"
    }, {
      value: 52,
      name: "50-59"
    }, {
      value: 62,
      name: "60-65"
    }];
  }

  getChildNumber() {
    this.LOV.childNumberLOV = [{
      value: 1,
      name: "1"
    }, {
      value: 2,
      name: "2"
    }, {
      value: 3,
      name: "3"
    }, {
      value: 4,
      name: "4"
    }];
  }

  generateCoverage(row: QuickQuoteResultDTO) {
    this.coverageData = [];
    var headers = [340];
    var exclude = [9998];
    this.coverageList.forEach(coverage => {
      var obj = {} as QuickQuoteResultDTO;
      if (coverage.numSimulacion == row.product) {
        var code = parseInt(coverage.codCob);
        obj.isHeader = headers.indexOf(code) !== -1;
        // bolder label if it is a header
        obj.label = obj.isHeader ? '<strong>' + coverage.nomCob + '</strong>' : coverage.nomCob;
        obj.premium = coverage.sumaAseg;
        // excluded rows
        if (exclude.indexOf(code) == -1) {
          this.coverageData.push(obj);
        }
      }
    });

    // displaying product coverage
    this.showProductCoverage = true;
    setTimeout(() => {
      Utility.scroll('productCoverage');
    }, 500);
  }

  quickQuote(accidentDetails: Accident) {
    this.qqs.quickQuoteAccident(accidentDetails).then(res => {
      if (!Utility.isUndefined(res)) {
        if (res.status) {
          var quickQuoteDetails = res.obj["quickQuoteDetails"];
          var productList = res.obj["productList"];
          this.coverageList = res.obj["coverage"];
          // generates quick quote accident details
          this.createQuickQuoteData(quickQuoteDetails, productList);
          // hiding product coverage
          this.showProductCoverage = false;
          // displaying product comparison
          this.showProductComparison = true;
          setTimeout(() => {
            Utility.scroll('productComparison');
          });
        } else {
          this.modalRef = Utility.showError(this.bms, res.message);
        }
      }
    });
  }
}
