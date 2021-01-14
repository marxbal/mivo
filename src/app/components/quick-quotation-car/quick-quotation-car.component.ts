import {
  Component,
  OnInit,
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
} from '../../utils/utility';
import {
  Car
} from '../../objects/Car';
import {
  CarListObject
} from 'src/app/objects/LOV/carList';
import {
  QuickQuoteService
} from '../../services/quickquote.service';
import {
  CarUtilityServices
} from '../../services/car-utility.service';
import {
  CarLOVServices
} from '../../services/lov/car.service';

export interface QuickQuoteResultDTO {
  label: string;
  compre: string;
  ctpl: string;
  autoCompre: string;
  autoComprePlus: string;
  autoLiabilityRegular: string;
  autoLiabilitySelect: string;
  autoSelect: string;
}

@Component({
  selector: 'app-quick-quotation-car',
  templateUrl: './quick-quotation-car.component.html',
  styleUrls: ['./quick-quotation-car.component.css']
})

export class QuickQuotationCarComponent implements OnInit, AfterViewChecked {
  carDetails = new Car();
  LOV = new CarListObject();
  quickQuoteForm: FormGroup;

  displayedColumns: string[] = [
    'label',
    'compre',
    'ctpl',
    'autoCompre',
    'autoComprePlus',
    'autoLiabilityRegular',
    'autoLiabilitySelect',
    'autoSelect'
  ];

  annualData: Array < QuickQuoteResultDTO > = [];
  plan30Data: Array < QuickQuoteResultDTO > = [];
  plan60Data: Array < QuickQuoteResultDTO > = [];
  plan90Data: Array < QuickQuoteResultDTO > = [];
  coveragelist: Array < QuickQuoteResultDTO > = [];
  
  vehicleValue: any;

  //flag to display product comparison and coverage
  showProductComparison: boolean = false;
  //modal reference
  modalRef: BsModalRef;

  constructor(
    private fb: FormBuilder,
    private cus: CarUtilityServices,
    private qqs: QuickQuoteService,
    private cls: CarLOVServices,
    private changeDetector: ChangeDetectorRef,
    private bms: BsModalService
  ) {
    this.createQuickQuoteForm();
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    var _this = this;
    this.cls.getMakeList().then(res => {
      _this.LOV.makeLOV = res;
    });
  }

  createQuickQuoteForm() {
    this.quickQuoteForm = this.fb.group({
      make: ['', Validators.required],
      model: ['', Validators.required],
      vehicleType: ['', Validators.required],
      modelYear: ['', Validators.required],
      subModel: ['', Validators.required],
      typeOfUse: ['', Validators.required],
      subline: ['', Validators.required],
      vehicleValue: ['', Validators.required],
    });
  }

  //getting the year difference between the current and selected model year
  getDiff() {
    var today = new Date();
    var currentYear = today.getFullYear();
    return currentYear - parseInt(this.carDetails.modelYear);
  }

  createObj(name: String, value: String, installment: String, product: number) {
    var diff = this.getDiff();

    //set value to 0 if conditions meets
    if (product != 1 && name == '2') {
      value = "0";
    } else if ((name == '3' || name == '4') && diff > 8) {
      value = "0";
    } else if ((name == '1') && diff < 8) {
      value = "0";
    }

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

  createQuickQuoteCoverage(coverage: any[], hasRoadAssist: boolean) {
    var coverages = [];
    var diff = this.getDiff();
    coverage.forEach(cov => {
      var coverageName = cov.nomCob;
      var coverageCode = cov.codCob;
      var product = cov.numSimulacion;
      var isIncluded = "N";

      if ("S" == cov.mcaOligatorio) {
        isIncluded = ((product == 3 || product == 4) && diff > 8) || (product == 1 && diff < 8) ? "N" : "S";
      } else if ("N" == cov.mcaOligatorio) {
        if (((product == 3 || product == 4) && diff > 8) || (product == 1 && diff < 8)) {
          isIncluded = "N";
        } else {
          if (hasRoadAssist && (coverageCode == "1040" || coverageCode == "1027" || coverageCode == "1029")) {
            if (coverageCode == "1040" && (product != 2 && product != 5 && product != 6)) {
              isIncluded = "ODRA"; //optional disabled ra with check
            } else {
              if ((coverageCode == "1040" || coverageCode == "1027" || coverageCode == "1029") &&
                (product == 2 || product == 5 || product == 6)) {
                isIncluded = "ORA"; //optional ra
              } else {
                isIncluded = "ORA"; //optional disabled ra without check
              }
            }
          } else {
            if (coverageCode == '1036' && product == 1) {
              isIncluded = "N";
            } else if ((coverageCode == "1004" || coverageCode == "1005") && product == "1") {
              isIncluded = "O"; //optional
            } else {
              isIncluded = "O"; //optional
            }
          }
        }
      } else {
        isIncluded = coverageCode == '1018' || coverageCode == '1037' || coverageCode == '1026' ? "S" : "N";
      }

      var icon = '';
      if (isIncluded == "S" || isIncluded == "ODRA") {
        icon = "<i class='far fa-check-circle'></i>"
      } else if (isIncluded == "N") {
        icon = "<i class='far fa-times-circle'></i>";
      } else if (isIncluded == "O" || isIncluded == "ORA") {
        icon = "<i class='far fa-circle'></i>";
      }

      if (!coverages.includes(coverageName)
        && coverageName != "UPPA - MR"
        && coverageName != "ACCD\'L DEATH/DISABL."
        && coverageName != "ALTERNATIVE TRANSPORT BENEFIT") {
        coverages.push(coverageName);
        var obj = {} as QuickQuoteResultDTO;
        obj.label = coverageName;
        obj.compre = "<i class='far fa-times-circle'></i>";
        obj.ctpl = "<i class='far fa-times-circle'></i>";
        obj.autoCompre = "<i class='far fa-times-circle'></i>";
        obj.autoComprePlus = "<i class='far fa-times-circle'></i>";
        obj.autoLiabilityRegular = "<i class='far fa-times-circle'></i>";
        obj.autoLiabilitySelect = "<i class='far fa-times-circle'></i>";
        obj.autoSelect = "<i class='far fa-times-circle'></i>";
        this.coveragelist.push(obj);
      }

      this.coveragelist.forEach(c => {
        if (c.label == coverageName) {
          if (product == 1) {
            c.compre = icon;
          } else if (product == 2) {
            c.ctpl = icon;
          } else if (product == 3) {
            c.autoCompre = icon;
          } else if (product == 4) {
            c.autoComprePlus = icon;
          } else if (product == 5) {
            c.autoLiabilityRegular = icon;
          } else if (product == 6) {
            c.autoLiabilitySelect = icon;
          } else if (product == 9) {
            c.autoSelect = icon;
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
    // initial values for products
    obj.compre = "0";
    obj.ctpl = "0";
    obj.autoCompre = "0";
    obj.autoComprePlus = "0";
    obj.autoLiabilityRegular = "0";
    obj.autoLiabilitySelect = "0";
    obj.autoSelect = "0";
    obj.label = "Installment";

    arr.forEach((a: any) => {
      var product = a["name"];
      var value = a["value"];
      if (product == 1) {
        obj.compre = this.setTotalValue(obj.compre, value);
      } else if (product == 2) {
        obj.ctpl = this.setTotalValue(obj.ctpl, value);
      } else if (product == 3) {
        obj.autoCompre = this.setTotalValue(obj.autoCompre, value);
      } else if (product == 4) {
        obj.autoComprePlus = this.setTotalValue(obj.autoComprePlus, value);
      } else if (product == 5) {
        obj.autoLiabilityRegular = this.setTotalValue(obj.autoLiabilityRegular, value);
      } else if (product == 6) {
        obj.autoLiabilitySelect = this.setTotalValue(obj.autoLiabilitySelect, value);
      } else if (product == 9) {
        obj.autoSelect = this.setTotalValue(obj.autoSelect, value);
      }
    });
    return obj;
  }

  createQQResultDTO(arr: any[], installment: String, isAnnual ? : boolean) {
    var obj = {} as QuickQuoteResultDTO;
    // initiate values for products
    obj.compre = "0";
    obj.ctpl = "0";
    obj.autoCompre = "0";
    obj.autoComprePlus = "0";
    obj.autoLiabilityRegular = "0";
    obj.autoLiabilitySelect = "0";
    obj.autoSelect = "0";

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
          obj.compre = price;
        } else if (product == 2) {
          obj.ctpl = price;
        } else if (product == 3) {
          obj.autoCompre = price;
        } else if (product == 4) {
          obj.autoComprePlus = price;
        } else if (product == 5) {
          obj.autoLiabilityRegular = price;
        } else if (product == 6) {
          obj.autoLiabilitySelect = price;
        } else if (product == 9) {
          obj.autoSelect = price;
        }
      }
    });
    return obj;
  }

  clearRiskDetails(level: number, type ? : boolean) {
    if (level <= 1) { //if user changes car make
      this.LOV.modelLOV = [];
      this.carDetails.model = undefined;
      this.quickQuoteForm.get('model').reset();
    }
    if (level <= 2) { //if user changes car model
      this.LOV.vehicleTypeLOV = [];
      this.carDetails.vehicleType = undefined;
      this.quickQuoteForm.get('vehicleType').reset();
    }
    if (level <= 3) { //if user changes vehicle type
      this.LOV.modelYearLOV = [];
      this.carDetails.modelYear = undefined;
      this.quickQuoteForm.get('modelYear').reset();
    }
    if (level <= 4) { //if user changes car model year
      this.LOV.subModelLOV = [];
      this.LOV.typeOfUseLOV = [];
      this.carDetails.subModel = undefined;
      this.carDetails.typeOfUse = undefined;
      this.quickQuoteForm.get('subModel').reset();
      this.quickQuoteForm.get('typeOfUse').reset();
    }
    if (level <= 5) { //if user changes car sub model or type of use
      if (level == 5) {
        if (type) {
          //if user changes type of use
          this.LOV.sublineLOV = [];
          this.carDetails.subline = undefined;
          this.quickQuoteForm.get('subline').reset();
        } else {
          //if user changes sub model
          this.carDetails.vehicleValue = undefined;
          this.quickQuoteForm.get('vehicleValue').reset();
        }
      } else {
        //if level is below 5, subline and vehicle value will reset
        this.LOV.sublineLOV = [];
        this.carDetails.subline = undefined;
        this.carDetails.vehicleValue = undefined;
        this.quickQuoteForm.get('subline').reset();
        this.quickQuoteForm.get('vehicleValue').reset();
      }
    }
  }

  makeOnchange() {
    this.clearRiskDetails(1);
    var _this = this;
    this.cls.getModelList(this.carDetails).then(res => {
      _this.LOV.modelLOV = res;
    });
  }

  modelOnchange() {
    const _carDetails = this.carDetails;
    this.clearRiskDetails(2);
    this.carDetails.make = _carDetails.make;

    var _this = this;
    this.cls.getVehicleTypeList(this.carDetails).then(res => {
      _this.LOV.vehicleTypeLOV = res;
    });
  }

  vehicleTypeOnchange() {
    const _carDetails = this.carDetails;
    this.clearRiskDetails(3);
    this.carDetails.make = _carDetails.make;
    this.carDetails.model = _carDetails.model;

    if (this.carDetails.vehicleType > 0) {
      var _this = this;
      this.cls.getModelYearList(this.carDetails).then(res => {
        _this.LOV.modelYearLOV = res;
      });
    }
  }

  modelYearOnchange() {
    const _carDetails = this.carDetails;
    this.clearRiskDetails(4);
    this.carDetails.make = _carDetails.make;
    this.carDetails.model = _carDetails.model;
    this.carDetails.vehicleType = _carDetails.vehicleType;

    if (this.carDetails.modelYear != '') {
      var _this = this;
      this.cls.getSubModelList(this.carDetails).then(res => {
        _this.LOV.subModelLOV = res;
      });
      this.cls.getTypeOfUseList(this.carDetails).then(res => {
        _this.LOV.typeOfUseLOV = res;
      });
    }
  }

  subModelOnchange() {
    const _carDetails = this.carDetails;
    this.clearRiskDetails(5, false);
    this.carDetails.make = _carDetails.make;
    this.carDetails.model = _carDetails.model;
    this.carDetails.vehicleType = _carDetails.vehicleType;
    this.carDetails.modelYear = _carDetails.modelYear;
    this.carDetails.subModel = _carDetails.subModel
    this.carDetails.typeOfUse = _carDetails.typeOfUse;
    this.carDetails.subline = _carDetails.subline;
    this.getVehicleValue();
  }

  typeOfUseOnchange() {
    const _carDetails = this.carDetails;
    this.clearRiskDetails(5, true);
    this.carDetails.make = _carDetails.make;
    this.carDetails.model = _carDetails.model;
    this.carDetails.vehicleType = _carDetails.vehicleType;
    this.carDetails.modelYear = _carDetails.modelYear;
    this.carDetails.subModel = _carDetails.subModel
    this.carDetails.typeOfUse = _carDetails.typeOfUse;
    this.carDetails.vehicleValue = _carDetails.vehicleValue;
    this.getSubline();
  }

  getVehicleValue() {
    const _this = this;
    this.cus.getFMV(this.carDetails).then(res => {
      _this.carDetails.vehicleValue = res.obj["fmv"];
    });
  }

  getSubline() {
    const _this = this;
    this.cus.getSubline(this.carDetails).then(res => {
      _this.LOV.sublineLOV = res.obj["list"];
    });
  }

  sublineOnchange(event: any) {
    var options = event.target.options;
    if (options.length) {
      //effectivity date is based on selected subline
      var selectedIndex = event.target.options.selectedIndex;
      var effectivityDate = event.target.options[selectedIndex].dataset.sublinedate;

      //effectivity date change format
      var d = moment(effectivityDate, 'DDMMYYYY').format('MMDDYYYY');
      this.carDetails.sublineEffectivityDate = d.toString();
    }
  }

  quickQuote(carDetails: Car) {
    this.qqs.quickQuoteCar(carDetails).then(res => {
      if (!Utility.isUndefined(res)) {
        if (res.status) {
          var quickQuoteDetails = res.obj["quickQuoteDetails"];
          var productList = res.obj["productList"];
          var products = res.obj["products"];
          var coverage = res.obj["coverage"];
          var hasRoadAssist = res.obj["hasRoadAssist"];

          this.createQuickQuoteData(quickQuoteDetails, productList, products);
          this.createQuickQuoteCoverage(coverage, hasRoadAssist);
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
