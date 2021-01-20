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
  Home
} from '../../objects/Home';
import {
  HomeListObject
} from 'src/app/objects/LOV/homeList';
import {
  QuickQuoteService
} from '../../services/quickquote.service'
import {
  HomeLOVServices
} from '../../services/lov/home.service'

export interface QuickQuoteResultDTO {
  label: string;
  fire: string;
  earth: string;
  water: string;
}

@Component({
  selector: 'app-quick-quotation-home',
  templateUrl: './quick-quotation-home.component.html',
  styleUrls: ['./quick-quotation-home.component.css']
})

export class QuickQuotationHomeComponent implements OnInit, AfterViewChecked {
  @Input() homeDetails = new Home();
  LOV = new HomeListObject();
  quickQuoteForm: FormGroup;

  displayedColumns: string[] = ['label', 'fire', 'earth', 'water'];

  annualData: Array < QuickQuoteResultDTO > = [];
  plan30Data: Array < QuickQuoteResultDTO > = [];
  plan60Data: Array < QuickQuoteResultDTO > = [];
  plan90Data: Array < QuickQuoteResultDTO > = [];
  coveragelist: Array < QuickQuoteResultDTO > = [];

  //flag to display product comparison
  showProductComparison: boolean = false;
  //modal reference
  modalRef: BsModalRef;

  constructor(
    private fb: FormBuilder,
    private hls: HomeLOVServices,
    private changeDetector: ChangeDetectorRef,
    private qqs: QuickQuoteService,
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
    this.hls.getHomeBusinessLine().then(res => {
      res.forEach(businessLine => {
        //display Residential only
        if (businessLine.COD_RAMO == "200" && businessLine.NOM_RAMO == "RESIDENTIAL") {
          _this.LOV.sublineLOV = [businessLine];
        }
      });
    });

    // default to residential
    this.homeDetails.subline = 200;
  }

  createQuickQuoteForm() {
    this.quickQuoteForm = this.fb.group({
      subline: ['', Validators.required],
      cbBuilding: [null],
      building: [null],
      cbContent: [null],
      content: [null],
      cbImprovements: [null],
      improvements: [null],
      cbRelatedBuild: [null],
      relatedBuild: [null],
      cbRelatedContent: [null],
      relatedContent: [null],
    });
  }

  setValidations() {
    const cbBuilding = this.quickQuoteForm.get('cbBuilding');
    const cbContent = this.quickQuoteForm.get('cbContent');
    const cbImprovements = this.quickQuoteForm.get('cbImprovements');
    const cbRelatedBuild = this.quickQuoteForm.get('cbRelatedBuild');
    const cbRelatedContent = this.quickQuoteForm.get('cbRelatedContent');

    const improvements = this.quickQuoteForm.get('improvements');
    const relatedBuild = this.quickQuoteForm.get('relatedBuild');
    const relatedContent = this.quickQuoteForm.get('relatedContent');

    cbBuilding.valueChanges.subscribe(checked => {
      const building = this.quickQuoteForm.get('building');
      this.homeDetails.building = Utility.setNull(checked, this.homeDetails.building);
      Utility.updateValidator(building, checked ? [Validators.required] : null);

      if (!checked && cbContent.value !== true) {
        this.homeDetails.improvements = null;
        this.homeDetails.relatedBuild = null;
        this.homeDetails.relatedContent = null;
        Utility.updateValidator(improvements, null);
        Utility.updateValidator(relatedBuild, null);
        Utility.updateValidator(relatedContent, null);
      } else if (cbContent.value === true) {
        Utility.updateValidator(improvements, cbImprovements.value === true ? [Validators.required] : null);
        Utility.updateValidator(relatedBuild, cbRelatedBuild.value === true ? [Validators.required] : null);
        Utility.updateValidator(relatedContent, cbRelatedContent.value === true ? [Validators.required] : null);
      }
    });

    cbContent.valueChanges.subscribe(checked => {
      const content = this.quickQuoteForm.get('content');
      this.homeDetails.content = Utility.setNull(checked, this.homeDetails.content);
      Utility.updateValidator(content, checked ? [Validators.required] : null);

      if (!checked && cbBuilding.value !== true) {
        this.homeDetails.improvements = null;
        this.homeDetails.relatedBuild = null;
        this.homeDetails.relatedContent = null;
        Utility.updateValidator(improvements, null);
        Utility.updateValidator(relatedBuild, null);
        Utility.updateValidator(relatedContent, null);
      } else if (cbBuilding.value === true) {
        Utility.updateValidator(improvements, cbImprovements.value === true ? [Validators.required] : null);
        Utility.updateValidator(relatedBuild, cbRelatedBuild.value === true ? [Validators.required] : null);
        Utility.updateValidator(relatedContent, cbRelatedContent.value === true ? [Validators.required] : null);
      }
    });

    cbImprovements.valueChanges.subscribe(checked => {
      this.homeDetails.improvements = Utility.setNull(checked, this.homeDetails.improvements);
      Utility.updateValidator(improvements, checked ? [Validators.required] : null);
    });

    cbRelatedBuild.valueChanges.subscribe(checked => {
      this.homeDetails.relatedBuild = Utility.setNull(checked, this.homeDetails.relatedBuild);
      Utility.updateValidator(relatedBuild, checked ? [Validators.required] : null);
    });

    cbRelatedContent.valueChanges.subscribe(checked => {
      this.homeDetails.relatedContent = Utility.setNull(checked, this.homeDetails.relatedContent);
      Utility.updateValidator(relatedContent, checked ? [Validators.required] : null);
    });
  }

  createObj(name: String, value: String, installment: String, product: number) {
    return {
      'name': name,
      'value': value,
      'installment': installment,
      'product': product
    };
  }

  createQuickQuoteData(quickQuoteDetails: any[], products: any[], productList: any[]) {
    this.annualData = [];
    this.plan30Data = [];
    this.plan60Data = [];
    this.plan90Data = [];
    var annual = [];
    var plan30 = [];
    var plan60 = [];
    var plan90 = [];
    productList.forEach(a => {
      quickQuoteDetails.forEach(b => {
        products.forEach(c => {
          if (a.COD_FRACC_PAGO === b.codFraccPago && a.COD_FRACC_PAGO === "1" && b.numSimulacion === c.numSimulacion) {
            annual.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 1));
          } else if (a.COD_FRACC_PAGO === b.codFraccPago && a.COD_FRACC_PAGO === "30" && b.numSimulacion === c.numSimulacion) {
            if (b.numCuota === "1") {
              plan30.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 30));
            } else if (b.numCuota === "2") {
              plan30.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 30));
            }
          } else if (a.COD_FRACC_PAGO === b.codFraccPago && a.COD_FRACC_PAGO === "60" && b.numSimulacion === c.numSimulacion) {
            if (b.numCuota === "1") {
              plan60.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 60));
            } else if (b.numCuota === "2") {
              plan60.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 60));
            } else if (b.numCuota === "3") {
              plan60.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 60));
            }
          } else if (a.COD_FRACC_PAGO === b.codFraccPago && a.COD_FRACC_PAGO === "90" && b.numSimulacion === c.numSimulacion) {
            if (b.numCuota === "1") {
              plan90.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 90));
            } else if (b.numCuota === "2") {
              plan90.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 90));
            } else if (b.numCuota === "3") {
              plan90.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 90));
            } else if (b.numCuota === "4") {
              plan90.push(this.createObj(c.numSimulacion, b.impRecibo, b.numCuota, 90));
            }
          }
        });
      });
    });

    this.annualData.push(this.createQQResultDTO(annual, '1', true));
    this.annualData.push(this.getInstallmentTotal(plan30));

    this.plan30Data.push(this.createQQResultDTO(plan30, '1'));
    this.plan30Data.push(this.createQQResultDTO(plan30, '2'));

    this.plan60Data.push(this.createQQResultDTO(plan60, '1'));
    this.plan60Data.push(this.createQQResultDTO(plan60, '2'));
    this.plan60Data.push(this.createQQResultDTO(plan60, '3'));

    this.plan90Data.push(this.createQQResultDTO(plan90, '1'));
    this.plan90Data.push(this.createQQResultDTO(plan90, '2'));
    this.plan90Data.push(this.createQQResultDTO(plan90, '3'));
    this.plan90Data.push(this.createQQResultDTO(plan90, '4'));
  }

  createQuickQuoteCoverage(coverage: any[]) {
    var coverages = [];

    coverage.forEach(cov => {
      var coverageName = cov.nomCob;
      var coverageCode = cov.codCob;
      var product = cov.numSimulacion;
      var isIncluded = cov.mcaOligatorio;

      var icon = '';
      if (isIncluded == "S") {
        icon = "<i class='far fa-check-circle'></i>"
      } else if (isIncluded == "N") {
        icon = "<i class='far fa-times-circle'></i>";
      }

      if (!coverages.includes(coverageName) && (coverageCode <= '2110' && coverageCode >= '2101')) {
        coverages.push(coverageName);
        var obj = {} as QuickQuoteResultDTO;
        obj.label = coverageName;
        obj.fire = "<i class='far fa-times-circle'></i>";
        obj.earth = "<i class='far fa-times-circle'></i>";
        obj.water = "<i class='far fa-times-circle'></i>";
        this.coveragelist.push(obj);
      }

      this.coveragelist.forEach(c => {
        if (c.label == coverageName) {
          if (product == 1) {
            c.fire = icon;
          } else if (product == 2) {
            c.earth = icon;
          } else if (product == 3) {
            c.water = icon;
          }
        }
      });
    });
  }

  setTotalValue(product: any, value: any) {
    if (product === undefined) {
      return value;
    } else {
      var x = parseFloat(product);
      var y = parseFloat(value);
      return (x + y).toString();
    }
  }

  getInstallmentTotal(arr: any[]) {
    var obj = {} as QuickQuoteResultDTO;
    obj.label = "Installment";
    arr.forEach((a: any) => {
      var product = a["name"];
      var value = a["value"];
      if (product == 1) {
        obj.fire = this.setTotalValue(obj.fire, value);
      } else if (product == 2) {
        obj.earth = this.setTotalValue(obj.earth, value);
      } else if (product == 3) {
        obj.water = this.setTotalValue(obj.water, value);
      }
    });
    return obj;
  }

  createQQResultDTO(arr: any[], installment: String, isAnnual ? : boolean) {
    var obj = {} as QuickQuoteResultDTO;

    if (installment == '1') {
      obj.label = isAnnual ? 'Annual' : '1st Installment';
    } else if (installment == '2') {
      obj.label = '2nd Installment';
    } else if (installment == '3') {
      obj.label = '3rd Installment';
    } else if (installment == '4') {
      obj.label = '4th Installment';
    }

    arr.forEach((a: any) => {
      var price = a["value"];
      var product = a["name"];
      if (a["installment"] == installment) {
        if (product == 1) {
          obj.fire = price;
        } else if (product == 2) {
          obj.earth = price;
        } else if (product == 3) {
          obj.water = price;
        }
      }
    });
    return obj;
  }

  quickQuote(homeDetails: Home) {
    this.qqs.quickQuoteHome(homeDetails).then(res => {
      if (res.status) {
        var quickQuoteDetails = res.obj["quickQuoteDetails"];
        var productList = res.obj["productList"];
        var products = res.obj["products"];
        var coverage = res.obj["coverage"];

        // generates quick quote home details
        this.createQuickQuoteData(quickQuoteDetails, productList, products);
        // generates product coverage
        this.createQuickQuoteCoverage(coverage);
        // displaying product comparison
        this.showProductComparison = true;
        setTimeout(() => {
          Utility.scroll('productComparison');
        });
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

}
