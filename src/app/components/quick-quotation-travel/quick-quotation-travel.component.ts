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
import * as moment from 'moment';
import {
  BsModalService,
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  Utility
} from 'src/app/utils/utility';
import {
  QQTravel
} from '../../objects/QQTravel';
import {
  TravelListObject
} from 'src/app/objects/LOV/travelList';
import {
  QuickQuoteService
} from '../../services/quickquote.service'
import {
  TravelLOVServices
} from '../../services/lov/travel.service'

export interface QuickQuoteResultDTO {
  label: string;
  complete: number;
  personalAssistance: number;
  assist: number;
  currency: string;
  code: number;
  isHeader: boolean;
}

@Component({
  selector: 'app-quick-quotation-travel',
  templateUrl: './quick-quotation-travel.component.html',
  styleUrls: ['./quick-quotation-travel.component.css']
})

export class QuickQuotationTravelComponent implements OnInit, AfterViewChecked {
  @Input() travelDetails = new QQTravel();
  LOV = new TravelListObject();
  quickQuoteForm: FormGroup;

  displayedColumns: string[] = ['label', 'complete', 'personalAssistance', 'assist'];

  travelData: Array < QuickQuoteResultDTO > = [];
  coverageData: Array < QuickQuoteResultDTO > = [];
  coverageList: [];

  mindate: Date = new Date();
  endDateMinDate: Date = moment().add(1, 'days').toDate();
  enableEndDate: boolean = false;

  //flag to display product comparison
  showProductComparison: boolean = false;
  //flag to display product coverage
  showProductCoverage: boolean = false;
  //modal reference
  modalRef: BsModalRef;

  constructor(
    private fb: FormBuilder,
    private qq: QuickQuoteService,
    private travellov: TravelLOVServices,
    private changeDetector: ChangeDetectorRef,
    private modalService: BsModalService
  ) {
    this.createQuickQuoteForm();
    this.setValidations();
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    var _this = this;
    this.travellov.getCurrencyList().then(res => {
      _this.LOV.currencyLOV = res;
    });
    this.travellov.getTravelPackage().then(res => {
      _this.LOV.packageLOV = res;
    });
    this.travellov.getTypeOfCoverage().then(res => {
      _this.LOV.coverageLOV = res;
    });
    this.travellov.getPurposeOfTrip().then(res => {
      _this.LOV.purposeOfTripLOV = res;
    });
    this.travellov.getAgeRange().then(res => {
      _this.LOV.ageRangeLOV = res;
    });
  }

  createQuickQuoteForm() {
    this.quickQuoteForm = this.fb.group({
      currency: ['', Validators.required],
      country: ['', Validators.required],
      travelPackage: ['', Validators.required],
      typeOfCoverage: ['', Validators.required],
      purposeTrip: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      noOfDays: ['', Validators.required],
      ageRange: ['', Validators.required]
    });
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  currencyOnchange() {
    var _this = this;

    //if currency is philippine peso
    this.travelDetails.country = this.travelDetails.currency === '1' ?
      [{
        NOM_PAIS: "PHILIPPINES",
        COD_PAIS: "PHL",
        NOM_VERNACULO: "PHILIPPINES",
        name: "PHILIPPINES",
        value: "PHL",
        type: "PHILIPPINES"
      }] :
      null;
    this.travelDetails.travelPackage = this.travelDetails.currency === '1' ?
      "P" :
      null;

    this.travellov.getCountryList(this.travelDetails).then(res => {
      res.forEach(country => {
        country.name = country.NOM_PAIS;
        country.value = country.COD_PAIS;
        country.type = country.NOM_VERNACULO;
      });
      _this.LOV.countryLOV = res;
    });
  }

  setValidations() {
    this.quickQuoteForm.get('endDate').valueChanges.subscribe(date => {
      var diff = moment(date).diff(moment(this.quickQuoteForm.get('startDate').value), 'days');
      this.travelDetails.noOfDays = diff >= 1 ? diff : 0;
    });

    this.quickQuoteForm.get('startDate').valueChanges.subscribe(date => {
      this.enableEndDate = date !== null && date !== undefined;
      var diff = 0;
      if (this.enableEndDate) {
        var diff = moment(this.quickQuoteForm.get('endDate').value).diff(moment(date), 'days');
        diff = diff === NaN ? 0 : diff;
        this.endDateMinDate = moment(date).add(1, 'days').toDate();
        if (diff < 1) {
          this.travelDetails.endDate = null;
        }
      } else {
        this.travelDetails.endDate = null;
      }

      this.travelDetails.noOfDays = diff >= 1 ? diff : 0;
    });

    this.quickQuoteForm.get('country').valueChanges.subscribe(countries => {
      var packageList = [];
      if (!Utility.isUndefined(countries)) {
        countries.forEach(country => {
          packageList.push(country.type);
        });
        if (packageList.indexOf("WORLD") !== -1) {
          this.travelDetails.travelPackage = "W";
        } else if (packageList.indexOf("SCHENGEN") !== -1) {
          this.travelDetails.travelPackage = "S";
        } else if (packageList.indexOf("ASIA") !== -1) {
          this.travelDetails.travelPackage = "A";
        } else {
          this.travelDetails.travelPackage = "P";
        }
      }
    });
  }

  generateCoverage(row: QuickQuoteResultDTO) {
    this.coverageData = [];
    var c = this.coverageList[row.label];
    //coverage headers
    var headers = [300, 332, 330, 302, 316, 319, 324, 333];
    c.forEach(coverage => {
      var obj = {} as QuickQuoteResultDTO;
      // bolder label if it is a header
      obj.isHeader = headers.indexOf(coverage.code) !== -1;
      obj.label = obj.isHeader ? '<strong>' + coverage.label + '</strong>' : coverage.label;
      obj.complete = coverage.complete;
      obj.personalAssistance = coverage.personalAssistance;
      obj.assist = coverage.assistOnly;
      obj.currency = coverage.currency;
      obj.code = coverage.code;
      this.coverageData.push(obj);
    });
    // display product coverage
    this.showProductCoverage = true;
    setTimeout(() => {
      var el = document.getElementById('productCoverage');
      Utility.scroll(el);
    }, 500);
  }

  quickQuote(travelDetails: QQTravel) {
    this.qq.quickQuoteTravel(travelDetails).then(res => {
      if (res.status) {
        this.travelData = [];
        this.coverageData = [];
        var quickQuoteDetails = res.obj["quickQuoteDetails"];
        this.coverageList = res.obj["coverages"];
        quickQuoteDetails.forEach(details => {
          var obj = {} as QuickQuoteResultDTO;
          obj.label = details.label;
          obj.complete = details.complete;
          obj.personalAssistance = details.personalAssistance;
          obj.assist = details.assistOnly;
          obj.currency = details.currency;
          this.travelData.push(obj);
        });
        
        // hiding product coverage
        this.showProductCoverage = false;
        // displaying product comparison
        this.showProductComparison = true;
        setTimeout(() => {
          var el = document.getElementById('productComparison');
          Utility.scroll(el);
        });
      } else {
        this.modalRef = Utility.showError(this.modalService, res.message);
      }
    });
  }

}
