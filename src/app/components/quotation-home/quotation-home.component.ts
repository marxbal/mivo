import {
  Component,
  OnInit,
  AfterViewChecked,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray
} from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import {
  Home
} from '../../objects/Home';
import {
  GroupPolicy
} from 'src/app/objects/GroupPolicy';
import {
  HomeListObject
} from 'src/app/objects/LOV/homeList';
import {
  GroupPolicyListObject
} from 'src/app/objects/LOV/groupPolicyList';
import {
  HomeLOVServices
} from '../../services/lov/home.service';
import {
  HomeIssueServices
} from '../../services/home-issue.service';
import {
  Globals
} from 'src/app/utils/global';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  Utility
} from 'src/app/utils/utility';
import {
  Router
} from '@angular/router';
import {
  page
} from 'src/app/constants/page';
import {
  ThirdPartyListObject
} from 'src/app/objects/LOV/thirdPartyList';
import {
  ThirdPartyLOVServices
} from 'src/app/services/lov/third-party-lov-service';
import {
  PaymentBreakdownModalComponent
} from '../payment-breakdown-modal/payment-breakdown-modal.component';
import {
  PrintingService
} from 'src/app/services/printing.service';
import {
  ReturnDTO
} from 'src/app/objects/ReturnDTO';

@Component({
  selector: 'app-quotation-home',
  templateUrl: './quotation-home.component.html',
  styleUrls: ['./quotation-home.component.css']
})
export class QuotationHomeComponent implements OnInit, AfterViewChecked {
  @ViewChild('proceedModal') proceedModal: TemplateRef < any > ;
  @ViewChild('validationModal') validationModal: TemplateRef < any > ;

  // currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';
  triggerCounter: number = 0;
  triggerCoverage: number = 0;
  triggerBreakdown: number = 0;
  // insuredHeadCount: number = 1;

  homeDetails = new Home();
  prevHomeDetails: Home = null;
  changedValues: any[] = [];

  invalidForms: any[] = [];

  groupPolicy = new GroupPolicy();
  policyHolder = new PolicyHolder();
  homeAddress = new PolicyHolder();
  quoteForm: FormGroup;
  minDate: Date = moment().subtract(65, 'years').toDate();
  maxDate: Date = moment().subtract(18, 'years').toDate();

  today: Date = new Date();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();

  showImprovement = false;
  showRelatedStructure = false;
  showRelatedContent = false;

  showOtherOccupation = false;
  showDetails: boolean = false;
  showSPADetails: boolean = false;
  showHCBIDetails: boolean = false;
  showCoverage: boolean = false;
  showPaymentBreakdown: boolean = false;

  //for payment breakdown
  paymentBreakdown: any[];
  paymentReceipt: {};

  //for coverage
  coverageList: any[];

  LOV = new HomeListObject();
  GPLOV = new GroupPolicyListObject();
  TPLOV = new ThirdPartyListObject();

  //allow user to edit the form
  editMode = true;

  //flag to show generate btn
  showGenerateBtn: boolean = true;
  //flag to show issue btn
  showIssueQuoteBtn: boolean = false;
  //flag to show print quote/proceed to issuance
  showProceedToIssuanceBtn: boolean = false;

  //flat to show issuance generate btn
  showIssuanceGenerateBtn = true;
  //flag to show save btn
  showSaveBtn: boolean = false;
  //flag to show post btn
  showPostBtn: boolean = false;
  //flag to show print btn
  showPrintBtn: boolean = false;

  //disable load button
  disableLoadBtn: boolean = true;

  //modal reference
  modalRef: BsModalRef;
  dialogRef: MatDialogRef < TemplateRef < any >> ;

  codeName: String;

  constructor(
    private fb: FormBuilder,
    private hls: HomeLOVServices,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private tpls: ThirdPartyLOVServices,
    private his: HomeIssueServices,
    private ps: PrintingService,
    private bms: BsModalService,
    public dialog: MatDialog,
  ) {
    this.createQuoteForm();
    this.setValidations();
  }

  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.loadInit();
    if (this.isIssuance) {
      this.pageLabel = 'Issuance';
      if (this.isLoadQuotation) {
        //if loaded from home quotation
        this.homeDetails.quotationNumber = Globals.loadNumber;
        this.loadQuotation();
        Globals.setLoadNumber('');
        Globals.setLoadQuotation(false);
      }
    }
  }

  createQuoteForm() {
    this.quoteForm = this.fb.group({
      quotationNumber: [null],
      subline: ['', Validators.required],
      currency: ['', Validators.required],
      buildingNumber: [null],
      subdivision: [null],
      buildingName: [null],
      streetName: [null],
      barangay: [null],
      region: ['', Validators.required],
      province: ['', Validators.required],
      city: ['', Validators.required],
      //building / content details
      buildingCapital: ['', Validators.required],
      contentValue: ['', Validators.required],
      constructionOfBuilding: ['', Validators.required],
      occupancyOfBuilding: ['', Validators.required],
      front: ['', Validators.required],
      right: ['', Validators.required],
      left: ['', Validators.required],
      rear: ['', Validators.required],
      improvement: ['', Validators.min(1)],
      relatedStructure: this.fb.array([]),
      relatedContent: this.fb.array([]),

      //general information
      effectivityDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      //product data
      paymentMethod: ['', Validators.required],
      product: ['', Validators.required],
    });
  }

  loadQuotation() {}

  loadLOVs() {}

  setValidations() {
    var quotationNumber = this.quoteForm.get('quotationNumber');
    quotationNumber.valueChanges.subscribe(number => {
      this.disableLoadBtn = Utility.isUndefined(number);
    });
  }

  loadInit() {
    this.setDefaultValue();

    var _this = this;
    this.hls.getHomeBusinessLine().then(res => {
      var temp = [];
      res.forEach(subline => {
        debugger
        if (subline.COD_RAMO === 200) {
          temp.push(subline);
        }
      });
      _this.LOV.sublineLOV = temp;
    });

    this.hls.getCurrency(this.homeDetails).then(res => {
      _this.LOV.currencyLOV = res;
    });
    this.hls.getRelatedStructureProperty(this.homeDetails).then(res => {
      res.forEach((rs: any) => {
        this.relatedStructure().push(this.loadRelatedDetails(rs.COD_VALOR, rs.NOM_VALOR));
      });
    });
    this.hls.getRelatedContentProperty(this.homeDetails).then(res => {
      res.forEach((rs: any) => {
        this.relatedContent().push(this.loadRelatedDetails(rs.COD_VALOR, rs.NOM_VALOR));
      });
    });
    this.hls.getProduct(this.homeDetails).then(res => {
      _this.LOV.productListLOV = res;
    });
    this.hls.getPaymentPlan(this.homeDetails).then(res => {
      _this.LOV.paymentMethodLOV = res;
    });

    this.tpls.getState(this.homeAddress).then(res => {
      _this.LOV.regionLOV = res;
    });
  }

  setDefaultValue() {
    //setting default value
    this.homeDetails.subline = 200; //residential
    this.homeDetails.sublineEffectivityDate = "15102014";
    this.homeDetails.effectivityDate = this.today; // current today
    this.homeDetails.currency = 1; //Philippine peso

    this.homeAddress.country = "PHL"; //Philippines
  }

  relatedStructure(): FormArray {
    return this.quoteForm.get("relatedStructure") as FormArray
  }

  relatedContent(): FormArray {
    return this.quoteForm.get("relatedContent") as FormArray
  }

  loadRelatedDetails(code: string, name: string): FormGroup {
    return this.fb.group({
      _value: ['', Validators.min(1)],
      _code: [code],
      _name: [name]
    });
  }

  getProvince() {
    const _this = this;
    this.homeAddress.state = this.homeDetails.region;
    this.tpls.getProvince(this.homeAddress).then(res => {
      _this.LOV.provinceLOV = res;
      this.homeDetails.province = null;
    });
  }

  getCity() {
    const _this = this;
    this.homeAddress.province = this.homeDetails.province;
    this.tpls.getCity(this.homeAddress).then(res => {
      _this.LOV.cityLOV = res;
      this.homeDetails.city = null;
    });
  }

  effectivityDateOnChange() {
    setTimeout(() => {
      this.homeDetails.expiryDate = moment(this.homeDetails.effectivityDate).add(1, 'years').toDate();
      this.expiryDateMinDate = this.homeDetails.expiryDate;
    }, 500);
  }

  populateCoverage(coverageList: any[]) {
    this.coverageList = coverageList;
    this.showCoverage = true;
    this.triggerCoverage = this.triggerCoverage + 1;
  }

  populatePaymentBreakdown(breakdown: any[], receipt: {}) {
    this.paymentBreakdown = breakdown;
    this.paymentReceipt = receipt;
    this.showPaymentBreakdown = true;
    this.triggerBreakdown = this.triggerBreakdown + 1;
    Utility.scroll('paymentBreakdown');
  }

  proceed(type: number) {
    //if user changes affecting values
    const hasChanges = this.changedValues.length != 0;

    const hasQuotationNumber = !Utility.isUndefined(this.homeDetails.quotationNumber);
    const isTemporaryQuotation = hasQuotationNumber && this.homeDetails.quotationNumber.startsWith('999');
    this.homeDetails.affecting = !hasQuotationNumber ||
      (hasQuotationNumber && isTemporaryQuotation) ||
      (hasQuotationNumber && !isTemporaryQuotation && hasChanges);
    if (hasChanges) {
      this.openProceedModal(type);
    } else {
      switch (type) {
        case 1: {
          this.issueQuote('S');
          break;
        }
        case 2: {
          this.issueQuote('N');
          break;
        }
        case 3: {
          this.savePolicy();
          break;
        }
        default: {
          this.postPolicy();
          break;
        }
      }
    }
  }

  openProceedModal(type: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.restoreFocus = false;
    dialogConfig.autoFocus = false;
    dialogConfig.role = 'dialog';
    dialogConfig.width = '500px';
    dialogConfig.data = {
      generateBtn: type == 1 || type == 2 || type == 3,
      saveBtn: type == 4
    };

    this.dialogRef = this.dialog.open(this.proceedModal, dialogConfig);
  }

  openValidationModal(q: FormGroup, g: FormGroup, c: FormGroup): void {
    //clear arrays
    let invalid = [];
    this.invalidForms = [];

    //list of incorrect label names
    var formLabels = [{
        cbOneTripOnly: 'oneTripOnly'
      },
      {
        name: "client'sName"
      }
    ]

    var quoteArr = Utility.findInvalidControls(q);
    invalid.push(...quoteArr);

    var groupPolicyArr = Utility.findInvalidControls(g);
    invalid.push(...groupPolicyArr);

    var policyHolderArr = Utility.findInvalidControls(c);
    invalid.push(...policyHolderArr);

    invalid.forEach((i) => {
      formLabels.forEach(f => {
        var correctLabel = f[i];
        if (!Utility.isUndefined(correctLabel)) {
          //replace label
          i = correctLabel;
        }
      });

      let label: string = i.replace(/([A-Z])/g, ' $1').trim();
      this.invalidForms.push(label.toLowerCase());
    });

    const dialogConfig = new MatDialogConfig();
    dialogConfig.restoreFocus = false;
    dialogConfig.autoFocus = false;
    dialogConfig.role = 'dialog';
    dialogConfig.width = '500px';

    this.dialogRef = this.dialog.open(this.validationModal, dialogConfig);
  }

  openPaymentBreakdownModal(receipt: any, breakdown: any, isPostPolicy: boolean) {
    const modalData = {
      number: isPostPolicy ? this.homeDetails.policyNumber : this.homeDetails.quotationNumber,
      product: this.codeName,
      payment: "ANNUAL",
      receipt: receipt,
      breakdown: breakdown,
      showExchangeRate: false,
      isPostPolicy: isPostPolicy,
      line: 'HOME' //TODO
    };

    this.dialog.open(PaymentBreakdownModalComponent, {
      width: '1000px',
      data: modalData
    });
  }

  manageBtn(opt: number) {
    if (opt == 1) {
      //hides payment breakdown panel
      this.showPaymentBreakdown = false;
      this.editMode = true;
    }

    if (this.isIssuance) {
      this.showIssuanceGenerateBtn = (opt == 1);
      this.showSaveBtn = (opt == 2);
      this.showPostBtn = (opt == 3);
      this.showPrintBtn = (opt == 4);
    } else {
      this.showGenerateBtn = (opt == 1);
      this.showIssueQuoteBtn = (opt == 2);
      this.showProceedToIssuanceBtn = (opt == 3);
    }
  }

  newQuote() {
    this.newPage(page.QUO.HOM);
  }

  newPolicy() {
    this.newPage(page.ISS.HOM);
  }

  newPage(page: string) {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page);
      this.router.navigate(['/reload']);
    }, 500);
  }

  affecting(key: string, label: string) {
    if (!Utility.isUndefined(this.homeDetails.quotationNumber) && this.prevHomeDetails != null) {
      let prev = this.prevHomeDetails[key] == undefined ? "" : this.prevHomeDetails[key];
      let curr = this.homeDetails[key] == undefined ? "" : this.homeDetails[key];
      if (curr instanceof Date) {
        curr = curr.getMonth() + "/" + curr.getDate() + "/" + curr.getFullYear();
        if (!Utility.isUndefined(prev)) {
          var prevDate = new Date(prev);
          prev = prevDate.getMonth() + "/" + prevDate.getDate() + "/" + prevDate.getFullYear();
        }
      }

      if (prev != curr) {
        if (!this.changedValues.includes(label)) {
          //if changedValues length is greater than 0, request is affecting
          this.changedValues.push(label);
        }
      } else {
        //remove all occurence
        this.changedValues = this.changedValues.filter(v => v !== label);
      }
    }
  }

  printQuote() {
    this.ps.printQuote(this.homeDetails.quotationNumber);
  }

  printPolicy() {
    this.ps.printPolicy(this.homeDetails.policyNumber);
  }

  proceedToIssuance() {
    this.ps.proceedToIssuance(this.homeDetails.quotationNumber, page.ISS.HOM);
  }

  getProductCode() {
    const _this = this;
    this.codeName = null;
    this.LOV.productListLOV.forEach(p => {
      if (p.COD_MODALIDAD == this.homeDetails.product) {
        _this.codeName = p.NOM_MODALIDAD;
      }
    });
  }

  //getting error or warning items
  getErrorItems(res: ReturnDTO, mcaTmpPptoMph: string, isIssuance: boolean) {
    const resErrorCode = res.obj["errorCode"];
    const resError = res.obj["error"];

    const isPostPolicy = Utility.isUndefined(resErrorCode);
    let items: any[] = isPostPolicy ?
      ["Error occured while posting policy. Please contact administration."] :
      ["Error code is " + resErrorCode + " but does not return any error message. Please contact administration."];

    if (!Utility.isUndefined(resError)) {
      const errArr = resError.split("~");
      if (errArr.length) {
        var arr = [];
        errArr.forEach((err: string) => {
          if (!Utility.isEmpty(err)) {
            arr.push(err);
          }
        });

        const resStatus = res.obj["status"];
        if (arr.length) {
          if (!resStatus && isPostPolicy) {
            //has error - can't proceed
            items = ["Failed to generate quotation number due to following reason/s:"].concat(arr);
          } else {
            // has warning - can proceed
            if (isIssuance) {
              items = ["Quotation has technical control due to following reason/s:"].concat(arr);
            } else {
              items = ("N" == mcaTmpPptoMph) ? ["Routed for approval due to following reason/s:"].concat(arr) : arr;
            }
          }
        }
      }
    }
    return items;
  }

  //generate and issue quote button
  issueQuote(mcaTmpPptoMph: string) {
    // S for generation and N for issue quotation
    this.assembleData(mcaTmpPptoMph);

    this.his.issueQuote(this.homeDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        const items = this.getErrorItems(res, mcaTmpPptoMph, false);
        const status = res.obj["status"];
        if (status) {
          //duplicating car details for comparison
          const deepClone = JSON.parse(JSON.stringify(this.homeDetails));
          this.prevHomeDetails = deepClone;

          this.editMode = false;
          const errorCode = res.obj["errorCode"];
          if (errorCode == "S") {
            //if quotation has a warning
            this.modalRef = Utility.showHTMLWarning(this.bms, items);
          }

          const policyNumber = res.obj["policyNumber"];
          this.homeDetails.quotationNumber = policyNumber;

          const breakdown = res.obj["breakdown"];
          const receipt = res.obj["receipt"];

          if ("S" == mcaTmpPptoMph) {
            //for generation of quote
            const message = "You have successfully generated a quotation - " + policyNumber;
            this.modalRef = Utility.showInfo(this.bms, message);

            const coverageList = res.obj["coverageList"];
            this.populateCoverage(coverageList);

            this.populatePaymentBreakdown(breakdown, receipt);
            this.manageBtn(2);
          } else {
            // for issuing the quote
            this.openPaymentBreakdownModal(receipt, breakdown, false);
            this.manageBtn(3);
          }
        } else {
          this.modalRef = Utility.showHTMLError(this.bms, items);
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

  assembleData(mcaTmpPptoMph: string) {
    this.homeDetails.mcaTmpPptoMph = mcaTmpPptoMph;

    // includes group policy to home details DTO
    this.homeDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to home details DTO
    this.homeDetails.policyHolder = this.policyHolder;

    // includes related structure to home details DTO
    var relatedStructure = this.quoteForm.get('relatedStructure').value;
    this.homeDetails.relatedStructureDetails = relatedStructure.length ? relatedStructure : [];

    // includes related content to home details DTO
    var relatedContent = this.quoteForm.get('relatedContent').value;
    this.homeDetails.relatedContentDetails = relatedContent.length ? relatedContent : [];

    // get product code
    this.getProductCode();

    // to trigger changes when regenerating quotation
    this.showCoverage = false;
    this.showPaymentBreakdown = false;
  }

  //save policy button
  savePolicy() {
    this.assembleData("N");

    this.his.savePolicy(this.homeDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        var items = this.getErrorItems(res, this.homeDetails.mcaTmpPptoMph, true);
        const status = res.obj["status"];
        if (status) {
          //duplicating home details for comparison
          const deepClone = JSON.parse(JSON.stringify(this.homeDetails));
          this.prevHomeDetails = deepClone;

          this.editMode = false;

          const errorCode = res.obj["errorCode"];
          const policyNumber = res.obj["policyNumber"];
          this.homeDetails.quotationNumber = policyNumber;

          const message = "You have successfully generated a new quotation: " + policyNumber;
          this.modalRef = Utility.showInfo(this.bms, message);

          const breakdown = res.obj["breakdown"];
          const receipt = res.obj["receipt"];
          this.populatePaymentBreakdown(breakdown, receipt);

          if (errorCode == "S") {
            //if quotation has a warning
            if (this.homeDetails.affecting) {
              items = ["Updated quotation number is: " + policyNumber].concat(items);
            }
            this.modalRef = Utility.showHTMLWarning(this.bms, items);
          } else {
            const message = "Policy saved successfully.";
            this.modalRef = Utility.showInfo(this.bms, message);
          }
          this.editMode = false;
          this.manageBtn(3);
        } else {
          this.modalRef = Utility.showHTMLError(this.bms, items);
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

  //post policy button
  postPolicy() {
    this.assembleData("N");

    this.his.postPolicy(this.homeDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        var items = this.getErrorItems(res, this.homeDetails.mcaTmpPptoMph, true);
        const status = res.obj["status"];
        const policyNumber = res.obj["policyNumber"];
        if (status && !Utility.isUndefined(policyNumber)) {
          this.editMode = false;
          this.homeDetails.policyNumber = policyNumber;

          const breakdown = res.obj["breakdown"];
          const receipt = res.obj["receipt"];
          this.populatePaymentBreakdown(breakdown, receipt);
          this.openPaymentBreakdownModal(receipt, breakdown, true);
          this.manageBtn(4);
        } else {
          this.modalRef = Utility.showHTMLError(this.bms, items);
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }
}
