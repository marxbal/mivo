import {
  Component,
  OnInit,
  AfterViewChecked,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray
} from '@angular/forms';
import * as moment from 'moment';
import {
  Accident
} from '../../objects/Accident';
import {
  GroupPolicy
} from 'src/app/objects/GroupPolicy';
import {
  Utility
} from '../../utils/utility';
import {
  Router
} from '@angular/router';
import {
  page
} from 'src/app/constants/page';
import {
  AccidentListObject
} from 'src/app/objects/LOV/accidentList';
import {
  GroupPolicyListObject
} from 'src/app/objects/LOV/groupPolicyList';
import {
  AccidentLOVServices
} from '../../services/lov/accident.service';
import {
  ThirdPartyLOVServices
} from 'src/app/services/lov/third-party-lov-service';
import {
  Globals
} from 'src/app/utils/global';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  PaymentBreakdownModalComponent
} from '../payment-breakdown-modal/payment-breakdown-modal.component';
import {
  ReturnDTO
} from 'src/app/objects/ReturnDTO';
import {
  AccidentIssueServices
} from 'src/app/services/accident-issue.service';

@Component({
  selector: 'app-quotation-accident',
  templateUrl: './quotation-accident.component.html',
  styleUrls: ['./quotation-accident.component.css']
})
export class QuotationAccidentComponent implements OnInit, AfterViewChecked {
  @ViewChild('proceedModal') proceedModal: TemplateRef < any > ;
  @ViewChild('validationModal') validationModal: TemplateRef < any > ;

  // currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';
  triggerCounter: number = 0;
  triggerCoverage: number = 0;
  insuredHeadCount: number = 1;

  accidentDetails = new Accident();
  prevAccidentDetails: Accident = null;
  changedValues: any[] = [];

  invalidForms: any[] = [];

  groupPolicy = new GroupPolicy();
  policyHolder = new PolicyHolder();
  quoteForm: FormGroup;
  minDate: Date = moment().subtract(65, 'years').toDate();
  maxDate: Date = moment().subtract(18, 'years').toDate();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();

  showOtherOccupation = false;
  showDetails: boolean = false;
  showSPADetails: boolean = false;
  showHCBIDetails: boolean = false;
  showCoverage: boolean = false;
  showPaymentBreakdown: boolean = false;

  LOV = new AccidentListObject();
  GPLOV = new GroupPolicyListObject();

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
    private als: AccidentLOVServices,
    private ais: AccidentIssueServices,
    private tpls: ThirdPartyLOVServices,
    private router: Router,
    public dialog: MatDialog,
    private bms: BsModalService,
    private changeDetector: ChangeDetectorRef
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
        //if loaded from accident quotation
        // this.accidentDetails.quotationNumber = Globals.loadNumber;
        // this.loadQuotation();
        Globals.setLoadNumber('');
        Globals.setLoadQuotation(false);
      }
    }
  }

  createQuoteForm() {
    this.quoteForm = this.fb.group({
      subline: ['', Validators.required],
      //general information
      effectivityDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      //insured details
      insured: this.fb.array([this.newInsured(true)]),
      //disablement value
      disablementValue: [null],
      //product data
      product: ['', Validators.required],
    });
  }

  setValidations() {
    var _this = this;
    var subline = this.quoteForm.get('subline');
    var disablementValue = this.quoteForm.get('disablementValue');
    // var cbWithHealthDeclaration = this.quoteForm.get('cbWithHealthDeclaration');
    // var preExistingIllness = this.quoteForm.get('preExistingIllness');

    subline.valueChanges.subscribe(subline => {
      if (subline != undefined) {
        this.accidentDetails.subline = subline;

        this.showSPADetails = subline == 323; //if standard personal accident is selected
        Utility.updateValidator(disablementValue, this.showSPADetails ? [Validators.required, Validators.max(2000000), Validators.min(10000)] : null);

        this.minDate = moment().subtract(this.showSPADetails ? 65 : 70, 'years').toDate();
        this.maxDate = moment().subtract(this.showSPADetails ? 18 : 1, 'years').toDate();

        this.als.getOccupationalClass(this.accidentDetails).then(res => {
          _this.LOV.occupationalClassLOV = res;
        });
        this.als.getProduct(this.accidentDetails).then(res => {
          _this.LOV.productListLOV = res;
        });
        this.als.getPaymentPlan(this.accidentDetails).then(res => {
          // alert(res);
        });
      }
    });

    // cbWithHealthDeclaration.valueChanges.subscribe(withHD => {
    //   if (withHD != undefined) {
    //     Utility.updateValidator(preExistingIllness, withHD ? [Validators.required] : null);
    //   }
    // });
  }

  loadInit() {
    var _this = this;
    this.als.getSubline().then(res => {
      _this.LOV.sublineLOV = res;
    });
    this.tpls.getSuffix().then(res => {
      _this.LOV.suffixLOV = res;
    });

    this.setDefaultValue();
  }

  setDefaultValue() {
    //setting default value
    this.accidentDetails.sublineEffectivityDate = "01012016";
    // this.accidentDetails.relationship = 'PRIMARY';
  }

  insured(): FormArray {
    return this.quoteForm.get("insured") as FormArray
  }

  newInsured(onLoad: boolean): FormGroup {
    const bdaymindate: Date = moment().subtract(65, 'years').toDate();
    var ageLimit = onLoad ? 18 : 0;
    const bdaymaxdate: Date = moment().subtract(ageLimit, 'years').toDate();
    const occupationList = [];

    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [null],
      suffix: ['', Validators.required],
      gender: ['', Validators.required],
      birthDate: ['', Validators.required],
      cbWithHealthDeclaration: [null],
      preExistingIllness: [null],
      occupationalClass: ['', Validators.required],
      occupation: ['', Validators.required],
      otherOccupation: [null],
      occupationList: FormArray,
      bdaymindate: [bdaymindate],
      bdaymaxdate: [bdaymaxdate],
    });
  }

  loadInsured(completeName: string, birthDate: Date, relationship: string, relationshipLabel: string, passportNumber: string, physicianName: string): FormGroup {
    const bdaymindate: Date = moment().subtract(relationship == 'C' ? 21 : 65, 'years').toDate();
    const bdaymaxdate: Date = moment().subtract(relationship == 'C' ? 1 : 18, 'years').toDate();
    const occupationList = [];

    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [null],
      suffix: ['', Validators.required],
      gender: ['', Validators.required],
      birthDate: ['', Validators.required],
      cbWithHealthDeclaration: [null],
      preExistingIllness: [null],
      occupationalClass: ['', Validators.required],
      occupation: ['', Validators.required],
      otherOccupation: [null],
      occupationList: FormArray,
      bdaymindate: [bdaymindate],
      bdaymaxdate: [bdaymaxdate],
    });
  }

  addInsured() {
    this.insured().push(this.newInsured(false));

    //hides the add insured button if insured head count is more than 6
    var insured = this.quoteForm.get('insured').value;
    this.insuredHeadCount = insured.length;
  }

  removeInsured(index: number) {
    this.insured().removeAt(index);

    //shows the add insured button if insured head count is less than 6
    var insured = this.quoteForm.get('insured').value;
    this.insuredHeadCount = insured.length;
  }

  // removeAllInsured() {
  //   // removing all insured
  //   var insured = this.quoteForm.get('insured').value;
  //   if (insured.length > 0) {
  //     // loop until all accessories removed
  //     this.insured().removeAt(0);
  //     this.removeAllInsured();
  //   }
  // }

  cbWithHealthDeclarationOnChange(insured: FormGroup) {
    var withHD = insured.controls['cbWithHealthDeclaration'].value;
    var preExistingIllness = insured.controls['preExistingIllness'];
    if (withHD != undefined) {
      Utility.updateValidator(preExistingIllness, withHD ? [Validators.required] : null);
    }
  }

  occupationalClassOnchange(insured: FormGroup) {
    var occupationList = insured.controls['occupationList'];
    var occupationalClass = insured.get('occupationalClass').value;
    this.showOtherOccupation = false;
    var otherOccupation = insured.get('otherOccupation');
    Utility.updateValidator(otherOccupation, null);

    this.als.getOccupation(this.accidentDetails, occupationalClass).then(res => {
      occupationList.setValue = res;
      console.log(occupationList.value);
    });
  }

  occupationOnchange() {
    const selectedOC = this.accidentDetails.occupationalClass + '199';
    this.showOtherOccupation = selectedOC == this.accidentDetails.occupation;

    var otherOccupation = this.quoteForm.get('otherOccupation');
    Utility.updateValidator(otherOccupation, this.showOtherOccupation ? [Validators.required] : null);
  }

  effectivityDateOnChange() {
    this.accidentDetails.expiryDate = moment(this.accidentDetails.effectivityDate).add(1, 'years').toDate();
    this.expiryDateMinDate = this.accidentDetails.expiryDate;
  }

  proceed(type: number) {
    //if user changes affecting values
    const hasChanges = this.changedValues.length != 0;

    const hasQuotationNumber = !Utility.isUndefined(this.accidentDetails.quotationNumber);
    const isTemporaryQuotation = hasQuotationNumber && this.accidentDetails.quotationNumber.startsWith('999');
    this.accidentDetails.affecting = !hasQuotationNumber ||
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
      number: isPostPolicy ? this.accidentDetails.policyNumber : this.accidentDetails.quotationNumber,
      product: this.codeName,
      payment: "ANNUAL",
      receipt: receipt,
      breakdown: breakdown,
      showExchangeRate: true,
      isPostPolicy: isPostPolicy,
      line: 'TRAVEL'
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
    this.newPage(page.QUO.ACC);
  }

  newPolicy() {
    this.newPage(page.ISS.ACC);
  }

  newPage(page: string) {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page);
      this.router.navigate(['/reload']);
    }, 500);
  }

  affecting(key: string, label: string) {
    if (!Utility.isUndefined(this.accidentDetails.quotationNumber) && this.prevAccidentDetails != null) {
      let prev = this.prevAccidentDetails[key] == undefined ? "" : this.prevAccidentDetails[key];
      let curr = this.accidentDetails[key] == undefined ? "" : this.accidentDetails[key];
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
    this.ais.printQuote(this.accidentDetails.quotationNumber);
  }

  printPolicy() {
    this.ais.printPolicy(this.accidentDetails.policyNumber);
  }

  proceedToIssuance() {
    this.ais.proceedToIssuance(this.accidentDetails.quotationNumber);
  }

  getProductCode() {
    this.codeName = null;

    // let travelPack: string;
    // this.LOV.packageLOV.forEach(tp => {
    //   if (tp.TRAVEL_PACK == this.accidentDetails.travelPackage) {
    //     travelPack = tp.NOM_VALOR;
    //   }
    // });

    // let coverageOption: string;
    // this.LOV.coverageOptionLOV.forEach(co => {
    //   if (co.COVERAGE_OPTIONS == this.accidentDetails.coverageOption) {
    //     coverageOption = co.NOM_VALOR == 'ASSISTANCE ONLY' ? 'ASSIST ONLY' : co.NOM_VALOR;
    //   }
    // });

    // let medicalExpenses: string;
    // this.LOV.medicalExpensesLOV.forEach(me => {
    //   if (me.VAL_CAMPO1 == this.accidentDetails.medicalExpenses) {
    //     const name: string = me.VAL_CAMPO2;
    //     const value: string = me.VAL_CAMPO1;
    //     medicalExpenses = name.includes("EUROS") ? value.concat(" euros") : value;
    //   }
    // });

    // this.codeName = this.accidentDetails.travelPackage == 'D' ?
    //   "DOMESTIC ".concat(medicalExpenses) :
    //   travelPack + " " + coverageOption + " " + medicalExpenses;

    // this.LOV.productListLOV.forEach(product => {
    //   if (this.codeName == product.NOM_MODALIDAD) {
    //     this.accidentDetails.product = product.COD_MODALIDAD;
    //   }
    // });
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
    this.accidentDetails.mcaTmpPptoMph = mcaTmpPptoMph;

    // includes group policy to travel details DTO
    this.accidentDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to travel details DTO
    this.accidentDetails.policyHolder = this.policyHolder;

    // get product code
    this.getProductCode();

    // to trigger changes when regenerating quotation
    this.showPaymentBreakdown = false;
    this.showCoverage = false;

    this.ais.issueQuote(this.accidentDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        const items = this.getErrorItems(res, mcaTmpPptoMph, false);
        const status = res.obj["status"];
        if (status) {
          //duplicating car details for comparison
          const deepClone = JSON.parse(JSON.stringify(this.accidentDetails));
          this.prevAccidentDetails = deepClone;

          this.editMode = false;
          const errorCode = res.obj["errorCode"];
          if (errorCode == "S") {
            //if quotation has a warning
            this.modalRef = Utility.showHTMLWarning(this.bms, items);
          }

          const policyNumber = res.obj["policyNumber"];
          this.accidentDetails.quotationNumber = policyNumber;

          const breakdown = res.obj["breakdown"];
          const receipt = res.obj["receipt"];

          if ("S" == mcaTmpPptoMph) {
            //for generation of quote
            const message = "You have successfully generated a quotation - " + policyNumber;
            this.modalRef = Utility.showInfo(this.bms, message);

            const coverageList = res.obj["coverageList"];
            // this.populateCoverage(coverageList);

            // this.populatePaymentBreakdown(breakdown, receipt);
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

  assembleIssuePolicyData() {
    // always N for issue policy
    this.accidentDetails.mcaTmpPptoMph = "N";

    // includes group policy to travel details DTO
    this.accidentDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to travel details DTO
    this.accidentDetails.policyHolder = this.policyHolder;

    // get product code
    this.getProductCode();
  }

  //save policy button
  savePolicy() {
    this.assembleIssuePolicyData();

    // to trigger changes when regenerating quotation
    this.showCoverage = false;
    this.showPaymentBreakdown = false;

    this.ais.savePolicy(this.accidentDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        var items = this.getErrorItems(res, this.accidentDetails.mcaTmpPptoMph, true);
        const status = res.obj["status"];
        if (status) {
          //duplicating travel details for comparison
          const deepClone = JSON.parse(JSON.stringify(this.accidentDetails));
          this.prevAccidentDetails = deepClone;

          this.editMode = false;

          const errorCode = res.obj["errorCode"];
          const policyNumber = res.obj["policyNumber"];
          this.accidentDetails.quotationNumber = policyNumber;

          const message = "You have successfully generated a new quotation: " + policyNumber;
          this.modalRef = Utility.showInfo(this.bms, message);

          const breakdown = res.obj["breakdown"];
          const receipt = res.obj["receipt"];
          // this.populatePaymentBreakdown(breakdown, receipt);

          if (errorCode == "S") {
            //if quotation has a warning
            if (this.accidentDetails.affecting) {
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
    this.assembleIssuePolicyData();

    // hides coverage and payment breakdown
    this.showCoverage = false;
    this.showPaymentBreakdown = false;

    // if (this.withTechControl) {
    //   this.modalRef = Utility.showWarning(this.bms, "Quotation has technical control. Please request for approval first before posting the policy.");
    // } else {
    this.ais.postPolicy(this.accidentDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        var items = this.getErrorItems(res, this.accidentDetails.mcaTmpPptoMph, true);
        const status = res.obj["status"];
        const policyNumber = res.obj["policyNumber"];
        if (status && !Utility.isUndefined(policyNumber)) {
          this.editMode = false;
          this.accidentDetails.policyNumber = policyNumber;

          const breakdown = res.obj["breakdown"];
          const receipt = res.obj["receipt"];
          // this.populatePaymentBreakdown(breakdown, receipt);
          this.openPaymentBreakdownModal(receipt, breakdown, true);
          this.manageBtn(4);
        } else {
          this.modalRef = Utility.showHTMLError(this.bms, items);
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
    // }
  }

}
