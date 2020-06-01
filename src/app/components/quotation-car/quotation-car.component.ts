import {
  Component,
  OnInit,
  AfterViewChecked,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl
} from '@angular/forms';
import * as moment from 'moment';
import {
  distinctUntilChanged
} from 'rxjs/operators';
import {
  BsModalService,
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  QuoteCar
} from '../../objects/QuoteCar';
import {
  GroupPolicy
} from 'src/app/objects/GroupPolicy';
import {
  Utility
} from '../../utils/utility';
import {
  CarLOVServices
} from '../../services/lov/car.service';
import {
  CarUtilityServices
} from '../../services/car-utility.service';
import {
  CarQuoteServices
} from '../../services/car-quote.service';
import {
  CarListObject
} from 'src/app/objects/LOV/carList';
import {
  GroupPolicyListObject
} from 'src/app/objects/LOV/groupPolicyList';
import {
  QQCar
} from 'src/app/objects/QQCar';
import {
  AuthenticationService
} from '../../services/authentication.service';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  MatDialog
} from '@angular/material';
import {
  PaymentBreakdownModalComponent
} from '../payment-breakdown-modal/payment-breakdown-modal.component';
import {
  Router
} from '@angular/router';
import {
  page
} from 'src/app/constants/page';
import {
  Globals
} from 'src/app/utils/global';
import {
  CoverageVariableData
} from 'src/app/objects/CoverageVariableData';
import {
  CoveragesComponent
} from '../coverages/coverages.component';

@Component({
  selector: 'app-quotation-car',
  templateUrl: './quotation-car.component.html',
  styleUrls: ['./quotation-car.component.css']
})
export class QuotationCarComponent implements OnInit, AfterViewChecked {
  @ViewChild(CoveragesComponent) appCoverage: CoveragesComponent;

  currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';

  carDetails = new QuoteCar();
  groupPolicy = new GroupPolicy();
  policyHolder = new PolicyHolder();
  secondaryPolicyHolder = new PolicyHolder();
  assigneePolicyHolder = new PolicyHolder();
  mortgageePolicyHolder = new PolicyHolder();
  coverageVariableData = new CoverageVariableData();

  quoteForm: FormGroup;
  cForm: FormGroup;

  today: Date = new Date();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();

  LOV = new CarListObject();
  GPLOV = new GroupPolicyListObject();

  showAccessories: boolean = false;
  showAdditionalInformation: boolean = false;
  showSubAgent: boolean = false;
  showCTPL: boolean = false;
  showPaymentBreakdown: boolean = false;
  showCoverage: boolean = false;
  showAssignee: boolean = false;
  showMortgagee: boolean = false;

  //for payment breakdown
  paymentBreakdown: any[];
  paymentReceipt: {};

  //for coverage
  coverageList: any[];
  amountList: any[];
  premiumAmount: any[];
  coverageAmount: any[];
  coverageVariable: any[];

  //disable change product input
  disableProductSelect = false;

  //flag if coverage is modified
  isModifiedCoverage = false;

  //flag to show generate btn
  showGenerateBtnGrp: boolean = true;
  //flag to show issue btn
  showIssueQuoteBtnGrp: boolean = false;
  //flag to show print quote/proceed to issuance
  showProceedToIssuanceBtnGrp: boolean = false;

  //disable load button
  disableLoadBtn: boolean = true;

  //modal reference
  modalRef: BsModalRef;
  
  constructor(
    private fb: FormBuilder,
    private cus: CarUtilityServices,
    private cls: CarLOVServices,
    private cqs: CarQuoteServices,
    private changeDetector: ChangeDetectorRef,
    private auths: AuthenticationService,
    private bms: BsModalService,
    private router: Router,
    public dialog: MatDialog,
  ) {
    // this.createQuoteForm();
    // this.setValidations();
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.createQuoteForm();
    this.setValidations();
    if (this.isIssuance) {
      this.pageLabel = 'Issuance';
      if (this.isLoadQuotation) {
        //if loaded from car quotation
        this.carDetails.quotationNumber = Globals.loadNumber;
        this.init();
      } else {
        this.init();
      }
    } else {
      this.init();
    }
  }

  init() {
    var _this = this;
    this.cls.getMakeList().then(res => {
      _this.LOV.makeLOV = res;
    });

    this.cls.getColor().then(res => {
      _this.LOV.colorLOV = res;
    });

    this.cls.getClassification().then(res => {
      _this.LOV.classificationLOV = res;
    });

    this.cls.getCoverageArea().then(res => {
      _this.LOV.coverageAreaLOV = res;
    });

    this.cls.getInspectionAssessment().then(res => {
      _this.LOV.inspectionAssessmentLOV = res;
    });

    if (this.isIssuance) {
      this.cus.getSubagents().then(res => {
        var subAgents = res.obj["subAgents"];
        subAgents.forEach(subAgent => {
          subAgent.name = subAgent.nomCompleto + "(" + subAgent.tipDocum + ")";
          subAgent.value = subAgent.codDocum;
        });
        _this.LOV.subagentLOV = subAgents;
      });

      this.cls.getMortgageClause().then(res => {
        _this.LOV.mortgageClauseLOV = res;
      });
    }

    this.setValue();
  }

  setValue() {
    //setting default value
    this.carDetails.color = 9999; // undeclared
    this.carDetails.receivedBy = this.currentUser.userName; //TODO
    this.carDetails.purchaseDate = this.today; // current today
    this.carDetails.receivedDate = this.today; // current today
    this.carDetails.effectivityDate = this.today; // current today
    this.carDetails.automaticAuth = "N";
    //additional policy information
    this.carDetails.cbPolicyOnlyDriver = true;
    this.carDetails.cbPolicyOwner = true;
  }

  createQuoteForm() {
    this.quoteForm = this.fb.group({
      quotationNumber: [null],
      //risk details
      make: ['', Validators.required],
      model: ['', Validators.required],
      vehicleType: ['', Validators.required],
      modelYear: ['', Validators.required],
      subModel: ['', Validators.required],
      typeOfUse: ['', Validators.required],
      subline: ['', Validators.required],
      vehicleValue: ['', Validators.required],
      //vehicle information
      color: ['', Validators.required],
      areaOfUsage: ['', Validators.required],
      conductionNumber: ['', Validators.required, this.validateConductionNumber.bind(this)],
      plateNumber: ['', Validators.required, this.validatePlateNumber.bind(this)],
      serialNumber: ['', Validators.required],
      engineNumber: ['', Validators.required],
      mvFileNumber: [null],
      purchaseDate: [null],
      receivedBy: ['', Validators.required],
      receivedDate: ['', Validators.required],

      //CTPL
      automaticAuth: {
        value: null,
        disabled: true
      },
      registrationType: [null],
      mvType: [null],
      cocNumber: [null],
      cbIsNotRequiredAuthNumber: [null],
      authNumber: [null],

      //accessories
      accessories: this.fb.array([]),

      effectivityDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      //additional policy information
      customRiskName: [null],
      seatingCapacity: [null],
      weight: [null],
      displacement: [null],
      classification: [null],
      coverageArea: [null],
      assuredsCoinsuranceShare: [null],
      cbWaivedMinPremium: [null],
      cbPrepaidPremium: [null],
      cbGlassEtchingEntitled: [null],
      glassEtchingAvailmentDate: [null],
      existingDamages: [null],
      inspectionAssessment: [null],
    //additional policy information for issuance
      cbPolicyOnlyDriver: {
        value: null,
        disabled: true
      },
      cbPolicyOwner: {
        value: null,
        disabled: true
      },
      cbHasAssignee: [null],
      cbVehicleMortgaged: [null],
      mortgageClause: [null],

      //product data
      paymentMethod: ['', Validators.required],
      product: ['', Validators.required],
      //subagent
      subAgent: [null],
    });
  }

  async validateConductionNumber(control: AbstractControl) {
    if (!Utility.isUndefined(control.value)) {
      //trigger after 5 characters
      if (control.value.length >= 5) {
        this.carDetails.conductionNumber = control.value;
        return this.cus.validateConductionNumberFormat(this.carDetails).then(res => {
          return res.status && res.obj["valid"] ? null : {
            invalidConductionNumber: true
          };
        });
      }
    }
  }

  async validatePlateNumber(control: AbstractControl) {
    if (!Utility.isUndefined(control.value)) {
      //trigger after 5 characters
      if (control.value.length >= 5) {
        this.carDetails.plateNumber = control.value;
        return this.cus.validatePlateNumberFormat(this.carDetails).then(res => {
          return res.status && res.obj["valid"] ? null : {
            invalidPlateNumber: true
          };
        });
      }
    }
  }

  loadQuotation() {
    alert(this.carDetails.quotationNumber);
  }

  setValidations() {
    var conductionNumber = this.quoteForm.get('conductionNumber');
    var plateNumber = this.quoteForm.get('plateNumber');
    var vehicleType = this.quoteForm.get('vehicleType');
    var cbIsNotRequiredAuthNumber = this.quoteForm.get('cbIsNotRequiredAuthNumber');
    var authNumber = this.quoteForm.get('authNumber');
    var quotationNumber = this.quoteForm.get('quotationNumber');
    var cbVehicleMortgaged = this.quoteForm.get('cbVehicleMortgaged');

    // if vehicle type is trailer, remove plate number required validation
    vehicleType.valueChanges.pipe(distinctUntilChanged()).subscribe(type => {
      if (type == 30) {
        Utility.updateValidator(plateNumber, null);
      }
    });

    //if has conduction number, plate number is not required
    conductionNumber.valueChanges.pipe(distinctUntilChanged()).subscribe(number => {
      Utility.updateValidator(plateNumber, !Utility.isUndefined(number) ? null : vehicleType.value == 30 ? null : Validators.required);
    });

    //if has plate number, conduction number is not required
    plateNumber.valueChanges.pipe(distinctUntilChanged()).subscribe(number => {
      Utility.updateValidator(conductionNumber, !Utility.isUndefined(number) ? null : Validators.required);
    });

    cbIsNotRequiredAuthNumber.valueChanges.pipe(distinctUntilChanged()).subscribe(bool => {
      Utility.updateValidator(authNumber, bool ? null : Validators.required);
    });

    quotationNumber.valueChanges.subscribe(number => {
      this.disableLoadBtn = Utility.isUndefined(number);
    });

    cbVehicleMortgaged.valueChanges.subscribe(mortgaged => {
      this.carDetails.mortgageClause = mortgaged ? 1 : 0;
    });
  }

  accessory(): FormArray {
    return this.quoteForm.get("accessories") as FormArray
  }

  newAccessory(): FormGroup {
    return this.fb.group({
      accessory: ['', Validators.required],
      accessoryType: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  addAccessory() {
    this.disableAccessory();
    this.accessory().push(this.newAccessory());
  }

  removeAccessory(index: number) {
    this.accessory().removeAt(index);
    this.disableAccessory();
  }

  disableAccessory() {
    var accessories = this.quoteForm.get('accessories').value;
    if (accessories.length > 0) {
      var temp = [];
      accessories.forEach(accessory => {
        temp.push(accessory.accessory);
      });
      this.LOV.accessoryListLOV.forEach(accessory => {
        accessory.disabled = temp.indexOf(accessory.COD_ACCESORIO) !== -1;
      });
    }
  }

  removeAccessories() {
    // removing all accessories
    var accessories = this.quoteForm.get('accessories').value;
    if (accessories.length > 0) {
      // loop until all accessories removed
      this.accessory().removeAt(0);
      this.removeAccessories();
    }
  }

  clearRiskDetails(level: number, type ? : boolean) {
    if (level <= 1) { //if user changes car make
      this.LOV.modelLOV = [];
      this.carDetails.model = undefined;
      this.quoteForm.get('model').reset();
    }
    if (level <= 2) { //if user changes car model
      this.LOV.vehicleTypeLOV = [];
      this.carDetails.vehicleType = undefined;
      this.quoteForm.get('vehicleType').reset();
    }
    if (level <= 3) { //if user changes vehicle type
      this.LOV.modelYearLOV = [];
      this.carDetails.modelYear = undefined;
      this.quoteForm.get('modelYear').reset();
    }
    if (level <= 4) { //if user changes car model year
      this.LOV.subModelLOV = [];
      this.LOV.typeOfUseLOV = [];
      this.carDetails.subModel = undefined;
      this.carDetails.typeOfUse = undefined;
      this.quoteForm.get('subModel').reset();
      this.quoteForm.get('typeOfUse').reset();
    }
    if (level <= 5) { //if user changes car sub model or type of use
      this.removeAccessories();
      if (level == 5) {
        if (type) {
          //if user changes type of use
          this.LOV.sublineLOV = [];
          this.carDetails.subline = undefined;
          this.quoteForm.get('subline').reset();
        } else {
          //if user changes sub model
          this.carDetails.vehicleValue = undefined;
          this.quoteForm.get('vehicleValue').reset();
        }
      } else {
        //if level is below 5, subline and vehicle value will reset
        this.LOV.sublineLOV = [];
        this.carDetails.subline = undefined;
        this.carDetails.vehicleValue = undefined;
        this.quoteForm.get('subline').reset();
        this.quoteForm.get('vehicleValue').reset();
      }
    }
  }

  makeOnchange() {
    const _carDetails = this.carDetails;
    this.clearRiskDetails(1);
    this.carDetails.make = _carDetails.make;

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
    this.carDetails.subModel = _carDetails.subModel;
    this.carDetails.vehicleValue = _carDetails.vehicleValue;
    this.getSubline();
  }

  getVehicleValue() {
    const _this = this;
    var qqDetails = new QQCar;
    qqDetails.make = this.carDetails.make;
    qqDetails.model = this.carDetails.model;
    qqDetails.subModel = this.carDetails.subModel;
    qqDetails.modelYear = this.carDetails.modelYear;
    this.cus.getFMV(qqDetails).then(res => {
      _this.carDetails.vehicleValue = res.obj["fmv"];
    });
  }

  getSubline() {
    const _this = this;
    var qqDetails = new QQCar;
    qqDetails.vehicleType = this.carDetails.vehicleType;
    qqDetails.typeOfUse = this.carDetails.typeOfUse;
    this.cus.getSubline(qqDetails).then(res => {
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

    const _this = this;
    this.cls.getAreaOfUsage(this.carDetails).then(res => {
      _this.LOV.areaOfUsageLOV = res;
    });

    this.cls.getAccessoryList(this.carDetails).then(res => {
      _this.LOV.accessoryListLOV = res;
    });
    this.removeAccessories();

    this.cls.getRegistrationType().then(res => {
      _this.LOV.registrationTypeLOV = res;
    });

    this.cls.getMVType().then(res => {
      _this.LOV.mvTypeLOV = res;
    });

    this.cls.getPaymentPlan(this.carDetails).then(res => {
      _this.LOV.paymentMethodLOV = res;
    });

    this.cls.getProduct(this.carDetails).then(res => {
      let avalidableProducts = [];
      res.forEach((e) => {
        //removing not MSO products
        if (e.COD_MODALIDAD != 10011 && e.COD_MODALIDAD != 10010) {
          avalidableProducts.push(e);
        }
      });
      _this.LOV.productListLOV = avalidableProducts;
    });

    this.cus.getPreAdditionalInfo(this.carDetails).then(res => {
      if (res.status) {
        _this.carDetails.seatingCapacity = res.obj["seatingCapacity"];
        _this.carDetails.weight = res.obj["weight"];
        _this.carDetails.displacement = res.obj["displacement"];
        _this.carDetails.customRiskName = res.obj["customRiskName"];
      }
    });
  }

  effectivityDateOnChange() {
    this.carDetails.expiryDate = moment(this.carDetails.effectivityDate).add(1, 'years').toDate();
    this.expiryDateMinDate = this.carDetails.expiryDate;
  }

  accessoryOnchange(event: any, index: number) {
    this.disableAccessory();
    var options = event.target.options;
    if (options.length) {
      var selectedIndex = event.target.options.selectedIndex;
      var price = event.target.options[selectedIndex].dataset.price;
      var type = event.target.options[selectedIndex].dataset.type;

      this.accessory().at(index).get('accessoryType').setValue(type == 'A' ? 'Additional' : type == 'B' ? 'Built-In' : 'Free');
      this.accessory().at(index).get('price').setValue(price);
    }
  }

  productOnChange() {
    if (this.isIssuance) {
      this.showCTPL = this.carDetails.productList == 10002;
      this.cqs.activateCTPL(this.quoteForm, this.carDetails);
      if (this.showCTPL) {
        Utility.scroll('CTPLAuth');
      }
    }
  }

  authCOCRegistration(){
    this.cus.authCOCRegistration(this.carDetails).then(res => {
      if (res.status) {
        if (res.obj['status']) {
          this.carDetails.authNumber = res.obj['authNumber'];
        } else {
          this.modalRef = Utility.showError(this.bms, res.obj['error']);
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

  populateCoverage(coverageList: any[], amountList: any[], premiumAmount: any[], coverageAmount: any[], coverageVariable: any[]) {
    this.coverageList = coverageList;
    this.amountList = amountList;
    this.premiumAmount = premiumAmount;
    this.coverageAmount = coverageAmount;
    this.coverageVariable = coverageVariable;
    this.showCoverage = true;
  }

  populatePaymentBreakdown(breakdown: any[], receipt: {}) {
    this.paymentBreakdown = breakdown;
    this.paymentReceipt = receipt;
    this.showPaymentBreakdown = true;
    Utility.scroll('coverages');
  }

  test() {
    console.log(this.appCoverage);
    // this.modalRef = Utility.showHTMLError(this.bms, items);
    // this.hasIssuedQuote = true;
    // this.openPaymentBreakdownModal([], []);
    // this.dialog.open(CoverageVariableDataComponent, {
    //   width: '1000px',
    //   data: 'modalData'
    // });
    console.log(this.carDetails);
  }

  // copyToClipboard(item) {
  //   document.addEventListener('copy', (e: ClipboardEvent) => {
  //     e.clipboardData.setData('text/plain', (item));
  //     e.preventDefault();
  //     document.removeEventListener('copy', null);
  //   });
  //   document.execCommand('copy');
  // }

  openPaymentBreakdownModal(receipt: any, breakdown: any) {
    let product = "";
    this.LOV.productListLOV.forEach((p)=> {
      if (p.COD_MODALIDAD == this.carDetails.productList) {
        product = p.NOM_MODALIDAD;
      }
    });

    let payment = "";    
    this.LOV.paymentMethodLOV.forEach((p)=> {
      if (p.COD_FRACC_PAGO == this.carDetails.paymentMethod) {
        payment = p.NOM_FRACC_PAGO;
      }
    });

    const modalData = {
      number: this.carDetails.quotationNumber,
      product: product,
      payment: payment,
      receipt: receipt,
      breakdown: breakdown,
      showExchangeRate: false,
    };

    this.dialog.open(PaymentBreakdownModalComponent, {
      width: '1000px',
      data: modalData
    });
  }

  manageBtn(opt: number) {
    this.showGenerateBtnGrp = (opt == 1 || opt == 4);
    if (opt == 1 || opt == 4) {
      const isModified = (opt == 4);
      this.isModifiedCoverage = isModified;
      this.showCoverage = isModified;
      this.showPaymentBreakdown = false;
      if (isModified) {
        Utility.scroll('coverages');
      }
    }

    this.showIssueQuoteBtnGrp = (opt == 2);
    this.showProceedToIssuanceBtnGrp = (opt == 3);
  }

  newQuote() {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page.QUO.CAR);
      this.router.navigate(['/reload']);
    }, 500);
  }

  printQuote() {
    this.cqs.printQuote(this.carDetails.quotationNumber);
  }

  proceedToIssuance() {
    this.cqs.proceedToIssuance(this.carDetails.quotationNumber);
  }

  //generate and issue quote button
  issueQuote(mcaTmpPptoMph: string) {
    // includes group policy to car details DTO
    this.carDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to car details DTO
    this.carDetails.policyHolder = this.policyHolder;
    // includes coverage variable data to car details DTO
    this.carDetails.coverageVariableData = this.coverageVariableData;

    // includes accessories to car details DTO
    var accessories = this.quoteForm.get('accessories').value;
    this.carDetails.accessories = accessories.length ? accessories : [];

    // includes coverages to car details DTO
    this.carDetails.coverages = [];
    if (!Utility.isUndefined(this.appCoverage)) {
      var coverages = this.appCoverage.cForm.get('coverages').value;
      this.carDetails.coverages = coverages.length ? coverages : [];
    }

    // to trigger changes when regenerating quotation
    this.showCoverage = this.isModifiedCoverage;
    this.showPaymentBreakdown = false;

    // S for generation and N for issue quotation
    this.carDetails.mcaTmpPptoMph = mcaTmpPptoMph;

    this.cqs.getCoverageByProduct(this.carDetails).then(res => {
      this.cqs.issueQuote(this.carDetails).then(res1 => {
        if (res1.status) {
          const errorCode = res1.obj["errorCode"];
          const error = res1.obj["error"];
          let items : any[] = ["Error code is " + errorCode + " but does not return any error message. Please contact administration."];
          if (!Utility.isUndefined(error)) {
            const errArr = error.split("~");
            if (errArr.length) {
              var arr = [];
              errArr.forEach((err: string) => {
                if (!Utility.isEmpty(err)) {
                  arr.push(err);
                }
              });
              
              if (arr.length) {
                items = ("N" == mcaTmpPptoMph) ? ["Routed for approval due to following reason/s:"].concat(arr) : arr;
              }
            }
          }
          
          const status = res1.obj["status"];
          const coverageAmount = res1.obj["coverageAmount"];;
          if (status && coverageAmount.length) {
            if (errorCode == "S") {
              //if quotation has a warning
              this.modalRef = Utility.showHTMLWarning(this.bms, items);
            }

            const policyNumber = res1.obj["policyNumber"];
            this.carDetails.quotationNumber = policyNumber;

            const breakdown = res1.obj["breakdown"];
            const receipt = res1.obj["receipt"];

            if ("S" == mcaTmpPptoMph) {
              //for generation of quote
              const message = "You have successfully generated a quotation - " + policyNumber;
              this.modalRef = Utility.showInfo(this.bms, message);

              const coverageList = res.obj["coverageList"];
              const amountList = res.obj["amountList"];;
              const premiumAmount = res1.obj["premiumAmount"];;
              const coverageVariable = res1.obj["coverageVariable"];

              if (this.isModifiedCoverage) {
                this.showCoverage = true;
              } else {
                this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
              }

              this.isModifiedCoverage = false;
              this.populatePaymentBreakdown(breakdown, receipt);
              this.manageBtn(2);
            } else {
              // for issuing the quote
              this.openPaymentBreakdownModal(receipt, breakdown);
              this.manageBtn(3);
            }
          } else {
            this.modalRef = Utility.showHTMLError(this.bms, items);
          }
        } else {
          this.modalRef = Utility.showError(this.bms, res1.message);
        }
      });
    });
  }
}