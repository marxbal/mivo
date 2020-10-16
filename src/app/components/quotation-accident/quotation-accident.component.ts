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
import {
  TravelLOVServices
} from 'src/app/services/lov/travel.service';
import { InsuredDetails } from 'src/app/objects/InsuredDetails';

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

  today: Date = new Date();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();

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
    private tls: TravelLOVServices,
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
        this.accidentDetails.quotationNumber = Globals.loadNumber;
        this.loadQuotation();
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

  loadQuotation() {
    this.ais.loadQuotation(this.accidentDetails.quotationNumber).then(res => {
      if (res.status) {
        this.manageBtn(2);
        const variableData = res.obj["variableData"] as any[];
        variableData.forEach(v => {
          const code = v.codCampo;
          const value: string = v.valCampo;
          console.log("code " + code);
          console.log("value " + value);
          let valueInt: number = undefined;
  
          try {
            valueInt = parseInt(value);
          } catch (e) {
            // do nothing
          }
  
          switch (code) {
            //general information details
            //TODO
            case "COD_MODALIDAD": {
              this.accidentDetails.product = value;
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });
  
        var tempInsured = [];

        const insuredDetails = res.obj["insuredDetails"] as any[];
        insuredDetails.forEach(i => {
          const code = i.codCampo;
          const value: string = i.valCampo;

          console.log("code " + code);
          console.log("value " + value);
          const occurence: number = i.numOcurrencia;
          // const index = occurence - 1;
          let valueInt: number = undefined;
  
          try {
            valueInt = parseInt(value);
          } catch (e) {
            // do nothing
          }
  
          switch (code) {
            //insured individual
            case "TXT_FIRST_NAME": {
              const obj = { firstName: value, occurence: occurence };
              tempInsured.push(obj);
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });

        var insureds = [];
        tempInsured.forEach(t => {
          const iObj = new InsuredDetails();
          iObj.firstName = t.firstName;
          insuredDetails.forEach(id => {
            const code = id.codCampo;
            const value: string = id.valCampo;
            console.log("code " + code);
            console.log("value " + value);
            const text: string = id.txtCampo;
            const occurence: number = id.numOcurrencia;
            let valueInt: number = undefined;
    
            try {
              valueInt = parseInt(value);
            } catch (e) {
              // do nothing
            }

            if (t.occurence == occurence) {
              switch (code) {
                case "TXT_FIRST_NAME": {
                  iObj.firstName = value;
                  break;
                }
                case "TXT_LAST_NAME": {
                  iObj.lastName = value;
                  break;
                }
                case "TXT_MIDDLE_INITIAL": {
                  iObj.middleName = value;
                  break;
                }
                case "TXT_SUFFIX": {
                  iObj.suffix = value;
                  iObj.suffixLabel = text;
                  break;
                }
                case "MCA_SEXO_ASEG": {
                  iObj.gender = value;
                  break;
                }
                case "RELATIONSHIP": {
                  iObj.relationship = value;
                  iObj.relationshipLabel = text;
                  break;
                }
                case "BIRTHDATE": {
                  const date = Utility.convertStringDate(value);
                  iObj.birthDate = date;
                  break;
                }
                case "TXT_HEALTH_DECLARA": {
                  iObj.cbWithHealthDeclaration = value == 'S';
                  break;
                }
                case "TXT_HEALTH_DECLARA_EXIST": {
                  iObj.preExistingIllness = value;
                  break;
                }
                case "COD_OCCUPATIONAL_CLASS": {
                  iObj.occupationalClass = value;
                  iObj.occupationalClassLabel = text;
                  break;
                }
                case "TXT_OCCUPATION": {
                  iObj.occupation = value;
                  iObj.occupationLabel = text;
                  break;
                }
                case "TXT_OCCUPATIONAL_CLAS_OTH": {
                  iObj.otherOccupation = value;
                  break;
                }
                default: {
                  // do nothing
                }
              }
            }
          });
          insureds.push(iObj);
        });

        if (insureds.length) {
          //removes all insured individual
          this.removeAllInsured();
          var temp: any[] = [];
          insuredDetails.forEach((ins: any) => {
            console.log("ins.firstName " + ins.firstName);
            temp.push({
              insured: ins.firstName
            });

            const showOtherOccupation = !Utility.isUndefined(ins.otherOccupation);
            this.insured().push(this.loadInsured(
              ins.firstName,
              ins.lastName,
              ins.middleName,
              ins.suffix,
              ins.suffixLabel,
              ins.gender,
              ins.birthDate,
              ins.relationship,
              ins.relationshipLabel,
              ins.cbWithHealthDeclaration,
              ins.preExistingIllness,
              ins.occupationalClass,
              ins.occupationalClassLabel,
              ins.occupation,
              ins.occupationLabel,
              ins.otherOccupation,
              showOtherOccupation));
          });
  
          var insuredForm = this.quoteForm.get('insured').value;
          this.accidentDetails.insuredDetails = insuredForm;
        } else {
          this.accidentDetails.insuredDetails = [] as any; //TODO
        }
  
        const generalInfo = res.obj["generalInfo"];
        console.log("generalInfo " + generalInfo);
        console.log("generalInfo.codRamo " + generalInfo.codRamo);
        this.accidentDetails.subline = generalInfo.codRamo;
        this.accidentDetails.effectivityDate = new Date(generalInfo.fecEfecPoliza);
        this.accidentDetails.expiryDate = new Date(generalInfo.fecVctoPoliza);
  
        this.groupPolicy.agentCode = generalInfo.codAgt;
        this.groupPolicy.groupPolicy = parseInt(generalInfo.numPolizaGrupo);
        this.groupPolicy.contract = generalInfo.numContrato;
        this.groupPolicy.subContract = generalInfo.numSubcontrato;
        this.groupPolicy.commercialStructure = generalInfo.codNivel3;
        this.accidentDetails.groupPolicy = this.groupPolicy;
  
        const docType = generalInfo.tipDocum;
        const docCode = generalInfo.codDocum;
        // preventing generic document type and code
        if ("MVO" != docType && !docCode.startsWith("MAPFREXX")) {
          this.policyHolder.documentType = docType;
          this.policyHolder.documentCode = docCode;
          this.policyHolder.isExisting = true;
        }
  
        this.loadLOVs();
  
        const coverageList = res.obj["coverageList"];
        this.populateCoverage(coverageList);
  
        //breakdwon
        const breakdown = res.obj["breakdown"];
        const receipt = res.obj["receipt"];
        this.populatePaymentBreakdown(breakdown, receipt);
  
        //cloning details from load quotation
        const deepClone = JSON.parse(JSON.stringify(this.accidentDetails));
        this.prevAccidentDetails = deepClone;
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
        this.accidentDetails.quotationNumber = "";
      }
    }).finally(() => {
      //trigger child component load quotation function
      this.triggerCounter = this.triggerCounter + 1;
    });
  }

  //loading of all LOV's for load quotation
  loadLOVs() {
    var _this = this;
    this.als.getOccupationalClass(this.accidentDetails).then(res => {
      _this.LOV.occupationalClassLOV = res;
    });
    this.als.getProduct(this.accidentDetails).then(res => {
      _this.LOV.productListLOV = res;
    });
  }

  setValidations() {
    var _this = this;
    var subline = this.quoteForm.get('subline');
    var disablementValue = this.quoteForm.get('disablementValue');

    subline.valueChanges.subscribe(subline => {
      if (subline != undefined) {
        this.accidentDetails.subline = subline;

        this.showSPADetails = subline == 323; //if standard personal accident is selected
        this.showHCBIDetails = subline == 326; //if hospital cash benefit is selected

        Utility.updateValidator(disablementValue, this.showSPADetails ? [Validators.required, Validators.max(2000000), Validators.min(10000)] : null);

        this.minDate = moment().subtract(this.showSPADetails ? 70 : 65, 'years').toDate();
        this.maxDate = moment().subtract(this.showSPADetails ? 1 : 18, 'years').toDate();

        //removes all insured inserted by the user
        this.removeAllInsured();
        //adds new form for insured individual with primary relationship
        this.addInsured(true);

        this.als.getOccupationalClass(this.accidentDetails).then(res => {
          _this.LOV.occupationalClassLOV = res;
        });
        this.als.getProduct(this.accidentDetails).then(res => {
          _this.LOV.productListLOV = res;
        });
        // this.als.getPaymentPlan(this.accidentDetails).then(res => {
        //   // alert(res);
        // });
      }
    });
  }

  loadInit() {
    var _this = this;
    this.als.getSubline().then(res => {
      _this.LOV.sublineLOV = res;
    });
    this.tpls.getSuffix().then(res => {
      _this.LOV.suffixLOV = res;
    });
    this.tls.getRelationship().then(res => {
      _this.LOV.relationshipLOV = res;
      _this.LOV.relationshipLOV.forEach((r) => {
        // disable primary
        r.disabled = r.COD_VALOR == 'P';
      });
    });

    this.setDefaultValue();
  }

  setDefaultValue() {
    //setting default value
    this.accidentDetails.sublineEffectivityDate = "01012016";
    this.accidentDetails.effectivityDate = this.today; // current today
  }

  insured(): FormArray {
    return this.quoteForm.get("insured") as FormArray
  }

  newInsured(onLoad: boolean): FormGroup {
    const occupationList = [];

    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [null],
      suffix: [null],
      suffixLabel: [''],
      gender: ['', Validators.required],
      birthDate: ['', Validators.required],
      relationship: [onLoad ? 'P' : '', Validators.required],
      relationshipLabel: [onLoad ? 'PRIMARY' : ''],
      cbWithHealthDeclaration: [null],
      preExistingIllness: [null],
      occupationalClass: ['', Validators.required],
      occupationalClassLabel: [''],
      occupation: ['', Validators.required],
      occupationLabel: [''],
      otherOccupation: [null],
      occupationList: [occupationList],
      showOtherOccupation: [false],
      bdaymindate: [this.minDate],
      bdaymaxdate: [this.maxDate],
    });
  }

  loadInsured(firstName: string,
    lastName: string,
    middleName: string,
    suffix: string,
    suffixLabel: string,
    gender: string,
    birthDate: Date,
    relationship: string,
    relationshipLabel: string,
    cbWithHealthDeclaration: boolean,
    preExistingIllness: string,
    occupationalClass: string,
    occupationalClassLabel: string,
    occupation: string,
    occupationLabel: string,
    otherOccupation: string,
    showOtherOccupation: boolean
    ): FormGroup {

    const isSPA = this.accidentDetails.subline == 323;
    const minAgeLimit = isSPA ? 70 : 65;
    const maxAgeLimit = isSPA ? 1 : 18;

    const bdaymindate: Date = moment().subtract(relationship == 'C' ? 21 : minAgeLimit, 'years').toDate();
    const bdaymaxdate: Date = moment().subtract(relationship == 'C' ? 1 : maxAgeLimit, 'years').toDate();
    let occupationList = [];

    this.als.getOccupation(this.accidentDetails, occupationalClass).then(res => {
      occupationList = res;
    });

    return this.fb.group({
      firstName: [firstName, Validators.required],
      lastName: [lastName, Validators.required],
      middleName: [middleName],
      suffix: [suffix],
      suffixLabel: [suffixLabel],
      gender: [gender, Validators.required],
      birthDate: [birthDate, Validators.required],
      relationship: [relationship, Validators.required],
      relationshipLabel: [relationshipLabel],
      cbWithHealthDeclaration: [cbWithHealthDeclaration],
      preExistingIllness: [preExistingIllness],
      occupationalClass: [occupationalClass, Validators.required],
      occupationalClassLabel: [occupationalClassLabel],
      occupation: [occupation, Validators.required],
      occupationLabel: [occupationLabel],
      otherOccupation: [otherOccupation],
      occupationList: [occupationList],
      showOtherOccupation: [showOtherOccupation],
      bdaymindate: [bdaymindate],
      bdaymaxdate: [bdaymaxdate],
    });
  }

  addInsured(onLoad : boolean) {
    this.insured().push(this.newInsured(onLoad));

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

  removeAllInsured() {
    // removing all insured
    var insured = this.quoteForm.get('insured').value;
    if (insured.length > 0) {
      // loop until all insured removed
      this.insured().removeAt(0);
      this.removeAllInsured();
    }
  }

  suffixOnChange(insured: FormGroup) {
    var val = insured.controls['suffix'].value;
    this.LOV.suffixLOV.forEach(r => {
      if (r.TIPO_SUFIJO_NOMBRE == val) {
        insured.controls['suffixLabel'].setValue(r.NOM_VALOR);
      }
    });
  }

  relationshipOnChange(insured: FormGroup) {
    var val = insured.controls['relationship'].value;
    var maxAge = (val == 'C') ? 23 : 65;
    var minAge = (val == 'C') ? 1 : 18;

    const bdaymindate: Date = moment().subtract(maxAge, 'years').toDate();
    insured.controls['bdaymindate'].setValue(bdaymindate);

    const bdaymaxdate: Date = moment().subtract(minAge, 'years').toDate();
    insured.controls['bdaymaxdate'].setValue(bdaymaxdate);

    insured.controls['birthDate'].setValue('');

    this.LOV.relationshipLOV.forEach(r => {
      if (r.COD_VALOR == val) {
        insured.controls['relationshipLabel'].setValue(r.NOM_VALOR);
      }
    });
  }

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

    this.LOV.occupationalClassLOV.forEach(oc => {
      if (oc.COD_VALOR == occupationalClass) {
        insured.controls['occupationalClassLabel'].setValue(oc.NOM_VALOR);
      }
    });

    this.als.getOccupation(this.accidentDetails, occupationalClass).then(res => {
      occupationList.setValue(res);
    });
  }

  occupationOnchange(insured: FormGroup) {
    var showOtherOccupation = insured.get('showOtherOccupation');
    var occupationalClass = insured.get('occupationalClass').value;
    var occupation = insured.get('occupation').value;
    const selectedOC: string = occupationalClass + '199';
    showOtherOccupation.setValue(selectedOC == occupation);
    var otherOccupation = insured.get('otherOccupation');
    Utility.updateValidator(otherOccupation, showOtherOccupation.value ? [Validators.required] : null);

    var occupationList = insured.controls['occupationList'].value;
    occupationList.forEach(o => {
      if (o.COD_VALOR == occupation) {
        insured.controls['occupationLabel'].setValue(o.NOM_VALOR);
      }
    });
  }

  effectivityDateOnChange() {
    setTimeout(() => {
      this.accidentDetails.expiryDate = moment(this.accidentDetails.effectivityDate).add(1, 'years').toDate();
      this.expiryDateMinDate = this.accidentDetails.expiryDate;
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
    Utility.scroll('paymentBreakdown');
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
      showExchangeRate: false,
      isPostPolicy: isPostPolicy,
      line: 'ACCIDENT'
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
    const _this = this;
    this.codeName = null;
    this.LOV.productListLOV.forEach(p => {
      if (p.COD_MODALIDAD == this.accidentDetails.product) {
        _this.codeName = p.NOM_MODALIDAD;
      }
    });
  }

  //getting error or warning items
  getErrorItems(res: ReturnDTO, mcaTmpPptoMph: string, isIssuance: boolean) {
    const resErrorCode = res.obj["errorCode"];
    const resError = res.obj["error"];

    const isPostPolicy = Utility.isUndefined(resErrorCode);
    let items: any[] = isPostPolicy ? ["Error occured while posting policy. Please contact administration."] : ["Error code is " + resErrorCode + " but does not return any error message. Please contact administration."];

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
    this.accidentDetails.mcaTmpPptoMph = mcaTmpPptoMph;

    // includes group policy to travel details DTO
    this.accidentDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to travel details DTO
    this.accidentDetails.policyHolder = this.policyHolder;

    // includes travelers to travel details DTO
    var insured = this.quoteForm.get('insured').value;
    this.accidentDetails.insuredDetails = insured.length ? insured : [];

    // get product code
    this.getProductCode();

     // to trigger changes when regenerating quotation
     this.showCoverage = false;
     this.showPaymentBreakdown = false;
  }

  //save policy button
  savePolicy() {
    this.assembleData("N");

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
    this.assembleData("N");

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
