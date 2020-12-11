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
  secondaryPolicyHolder = new PolicyHolder();
  mortgageePolicyHolder = new PolicyHolder();
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
      this.editMode = false;
      if (this.isLoadQuotation) {
        //if loaded from home quotation
        this.editMode = true;
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

      district: this.isIssuance ? ['', Validators.required] : [null],
      blockNumber: this.isIssuance ? ['', Validators.required] : [null],
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
      contentValue: [null],
      buildingContent: [null],

      constructionOfBuilding: ['', Validators.required],
      occupancyOfBuilding: ['', Validators.required],
      front: ['', Validators.required],
      right: ['', Validators.required],
      left: ['', Validators.required],
      rear: ['', Validators.required],
      improvement: ['', Validators.min(1)],
      relatedStructure: this.fb.array([]),
      relatedContent: this.fb.array([]),

      crestaZone: [null],
      zipCode: this.isIssuance ? ['', Validators.required] : [null],
      cbMortgagee: [null],

      warrantedNoLoss: [null],

      ratePercentage: this.isIssuance ? ['', Validators.required] : [null],

      //general information
      effectivityDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      //product data
      paymentMethod: ['', Validators.required],
      product: ['', Validators.required],
    });
  }

  loadQuotation() {
    this.his.loadQuotation(this.homeDetails.quotationNumber).then(res => {
      if (res.status) {
        this.editMode = true;

        this.manageBtn(2);
        const variableData = res.obj["variableData"] as any[];
        variableData.forEach(v => {
          const code = v.codCampo;
          const value: string = v.valCampo;
          let valueInt: number = undefined;
          let valueFloat: number = undefined;
  
          try {
            valueInt = parseInt(value);
          } catch (e) {
            // do nothing
          }

          try {
            valueFloat = parseFloat(value);
          } catch (e) {
            // do nothing
          }
  
          switch (code) {
            case "COD_DISTRICT": {
              this.homeDetails.district = value;
              break;
            }
            case "NUM_BLOCK_DISTRICT": {
              this.homeDetails.blockNumber = value;
              break;
            }
            case "NUM_HOUSE_LOCATION": {
              this.homeDetails.buildingNumber = value;
              break;
            }
            case "TXT_VILLAGE_SUBDIVISION": {
              this.homeDetails.subdivision = value;
              break;
            }
            case "TXT_BUILDING_NAME": {
              this.homeDetails.buildingName = value;
              break;
            }
            case "TXT_STREET_NAME": {
              this.homeDetails.streetName = value;
              break;
            }
            case "TXT_BARANGAY": {
              this.homeDetails.barangay = value;
              break;
            }
            case "COD_REGION": {
              this.homeDetails.region = valueInt;
              break;
            }
            case "COD_PROVINCE": {
              this.homeDetails.province = valueInt;
              break;
            }
            case "COD_MUNICIPALITY": {
              this.homeDetails.city = valueInt;
              break;
            }
            case "TXT_CONSTRUCTION_BUILDING": {
              this.homeDetails.constructionOfBuilding = value;
              break;
            }
            case "TXT_OCCUPANCY_BUILDING": {
              this.homeDetails.occupancyOfBuilding = value;
              break;
            }

            case "TXT_BOUNDARY_DESC1": {
              this.homeDetails.front = value;
              break;
            }
            case "TXT_BOUNDARY_DESC2": {
              this.homeDetails.right = value;
              break;
            }
            case "TXT_BOUNDARY_DESC3": {
              this.homeDetails.left = value;
              break;
            }
            case "TXT_BOUNDARY_DESC4": {
              this.homeDetails.rear = value;
              break;
            }

            case "COD_CRESTA_ZONE": {
              this.homeDetails.crestaZone = value;
              break;
            }
            case "NUM_ZIPCODE": {
              this.homeDetails.zipCode = valueInt;
              break;
            }

            case "PCT_RATE_MANUAL": {
              this.homeDetails.ratePercentage = valueFloat;
              break;
            }

            case "COD_MODALIDAD": {
              this.homeDetails.product = valueInt;
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });
  
        const generalInfo = res.obj["generalInfo"];
        this.homeDetails.subline = generalInfo.codRamo;
        this.homeDetails.effectivityDate = new Date(generalInfo.fecEfecPoliza);
        this.homeDetails.expiryDate = new Date(generalInfo.fecVctoPoliza);
        this.homeDetails.paymentMethod = generalInfo.codFraccPago;
  
        this.groupPolicy = new GroupPolicy;
        this.groupPolicy.agentCode = generalInfo.codAgt;
        if (!Utility.isUndefined(generalInfo.numPolizaGrupo)) {
          this.groupPolicy.groupPolicy = parseInt(generalInfo.numPolizaGrupo);
        }
        if (!Utility.isUndefined(generalInfo.numContrato)) {
          this.groupPolicy.contract = parseInt(generalInfo.numContrato);
        }
        if (!Utility.isUndefined(generalInfo.numSubcontrato)) {
          this.groupPolicy.subContract = parseInt(generalInfo.numSubcontrato);
        }
        this.groupPolicy.commercialStructure = generalInfo.codNivel3;
        this.homeDetails.groupPolicy = this.groupPolicy;
  
        const docType = generalInfo.tipDocum;
        const docCode = generalInfo.codDocum;
        // preventing generic document type and code
        if ("MVO" != docType && !docCode.startsWith("MAPFREXX")) {
          this.policyHolder.documentType = docType;
          this.policyHolder.documentCode = docCode;
          this.policyHolder.isExisting = true;
        }

        var relatedStructure = [];
        var relatedContent = [];
        const relatedDetails = res.obj["relatedDetails"] as any[];
        relatedDetails.forEach(i => {
          const code = i.codCampo;
          const value: string = i.valCampo;
          const occurence: number = i.numOcurrencia;

          switch (code) {
            //related structure
            case "VAL_RISK_2157": {
              const obj = { val: value, occ: occurence };
              relatedStructure.push(obj);
              break;
            }

            //related content
            case "VAL_RISK_2357": {
              const obj = { val: value, occ: occurence };
              relatedContent.push(obj);
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });

        const buildingCapital = res.obj["buildingCapital"];
        if (buildingCapital.length != 0) {
          this.homeDetails.buildingCapital = buildingCapital[0].sumaAseg;
        }

        const contentValue = res.obj["contentValue"];
        if (contentValue.length != 0) {
          this.homeDetails.contentValue = contentValue[0].sumaAseg;
        }

        const improvement = res.obj["improvement"];
        if (improvement.length != 0) {
          this.homeDetails.improvement = improvement[0].sumaAseg;
        }

        this.relatedStructure().controls.forEach(element => {
          relatedStructure.forEach(rs => {
            const stringValue = rs.val;
            const num = parseInt(stringValue);
            if (element.value._code == rs.occ && num > 0) {
              element.get("_value").setValue(stringValue);
            }
          });
        });

        this.relatedContent().controls.forEach(element => {
          relatedContent.forEach(rs => {
            const stringValue = rs.val;
            const num = parseInt(stringValue);
            if (element.value._code == rs.occ && num > 0) {
              element.get("_value").setValue(stringValue);
            }
          });
        });

        // var insureds = [];
        // tempInsured.forEach(t => {
        //   const iObj = new InsuredDetails();
        //   iObj.firstName = t.firstName;
        //   insuredDetails.forEach(id => {
        //     const code = id.codCampo;
        //     const value: string = id.valCampo;
        //     const text: string = id.txtCampo;
        //     const occurence: number = id.numOcurrencia;
        //     let valueInt: number = undefined;
    
        //     try {
        //       valueInt = parseInt(value);
        //     } catch (e) {
        //       // do nothing
        //     }

        //     if (t.occurence == occurence) {
        //       iObj.occurence = occurence.toString();
        //       switch (code) {
        //         case "TXT_FIRST_NAME": {
        //           iObj.firstName = value;
        //           break;
        //         }
        //         case "TXT_LAST_NAME": {
        //           iObj.lastName = value;
        //           break;
        //         }
        //         case "TXT_MIDDLE_INITIAL": {
        //           iObj.middleName = value;
        //           break;
        //         }
        //         case "TXT_SUFFIX": {
        //           iObj.suffix = valueInt;
        //           iObj.suffixLabel = text;
        //           break;
        //         }
        //         case "MCA_SEXO_ASEG": {
        //           iObj.gender = valueInt;
        //           break;
        //         }
        //         case "RELATIONSHIP": {
        //           iObj.relationship = value;
        //           iObj.relationshipLabel = text;
        //           break;
        //         }
        //         case "BIRTHDATE": {
        //           const date = Utility.convertStringDate(value);
        //           iObj.birthDate = date;
        //           break;
        //         }
        //         case "TXT_HEALTH_DECLARA": {
        //           iObj.cbWithHealthDeclaration = value == 'S';
        //           break;
        //         }
        //         case "TXT_HEALTH_DECLARA_EXIST": {
        //           iObj.preExistingIllness = value;
        //           break;
        //         }
        //         case "COD_OCCUPATIONAL_CLASS": {
        //           iObj.occupationalClass = value;
        //           iObj.occupationalClassLabel = text;
        //           break;
        //         }
        //         case "TXT_OCCUPATION": {
        //           iObj.occupation = value;
        //           iObj.occupationLabel = text;
        //           break;
        //         }
        //         case "TXT_OCCUPATIONAL_CLAS_OTH": {
        //           iObj.otherOccupation = value;
        //           break;
        //         }
        //         default: {
        //           // do nothing
        //         }
        //       }
        //     }
        //   });
        //   insureds.push(iObj);
        // });

        // const occupationLists = res.obj["occupationLists"] as any[];
        
        // if (insureds.length) {
        //   //removes all insured individual
        //   this.removeAllInsured();
        //   var temp: any[] = [];
        //   insureds.forEach((ins: any) => {
        //     temp.push({
        //       insured: ins.firstName
        //     });

        //     const showOtherOccupation = !Utility.isUndefined(ins.otherOccupation);
        //     this.insured().push(this.loadInsured(
        //       ins.firstName,
        //       ins.lastName,
        //       ins.middleName,
        //       ins.suffix,
        //       ins.suffixLabel,
        //       ins.gender,
        //       ins.birthDate,
        //       ins.relationship,
        //       ins.relationshipLabel,
        //       ins.cbWithHealthDeclaration,
        //       ins.preExistingIllness,
        //       ins.occupationalClass,
        //       ins.occupationalClassLabel,
        //       ins.occupation,
        //       ins.occupationLabel,
        //       ins.otherOccupation,
        //       showOtherOccupation,
        //       occupationLists[ins.occurence]));
        //   });

        //   var insuredForm = this.quoteForm.get('insured').value;
        //   this.accidentDetails.insuredDetails = insuredForm;
        // } else {
        //   this.accidentDetails.insuredDetails = [] as any; //TODO
        // }
  
        this.loadLOVs();
  
        const coverageList = res.obj["coverageList"];
        this.populateCoverage(coverageList);
  
        //breakdwon
        const breakdown = res.obj["breakdown"];
        const receipt = res.obj["receipt"];
        this.populatePaymentBreakdown(breakdown, receipt);
  
        //cloning details from load quotation
        const deepClone = JSON.parse(JSON.stringify(this.homeDetails));
        this.prevHomeDetails = deepClone;
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
        this.homeDetails.quotationNumber = "";
      }
    }).finally(() => {
      //trigger child component load quotation function
      this.triggerCounter = this.triggerCounter + 1;
    });
  }

  loadLOVs() {
    var _this = this;
    this.homeAddress.state = this.homeDetails.region;
    this.tpls.getProvince(this.homeAddress).then(res => {
      _this.LOV.provinceLOV = res;
    });

    this.homeAddress.province = this.homeDetails.province;
    this.tpls.getCity(this.homeAddress).then(res => {
      _this.LOV.cityLOV = res;
    });

    this.homeAddress.city = this.homeDetails.city;
    this.tpls.getZipCode(this.homeAddress).then(res => {
      _this.LOV.zipCodeLOV = res;
    });

    if (!Utility.isUndefined(this.homeDetails.district)) {
      this.getBlockNumber();
    }
  }

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
        //residential only
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
        this.relatedStructure().push(this.newRelatedDetails(rs.COD_VALOR, rs.NOM_VALOR));
      });
    });
    this.hls.getRelatedContentProperty(this.homeDetails).then(res => {
      res.forEach((rs: any) => {
        this.relatedContent().push(this.newRelatedDetails(rs.COD_VALOR, rs.NOM_VALOR));
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

    this.hls.getDistrict().then(res => {
      _this.LOV.districtLOV = res;
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

  loadRelatedDetails(value: number, code: string, name: string): FormGroup {
    return this.fb.group({
      _value: ['', Validators.min(1)],
      _code: [code],
      _name: [name]
    });
  }

  removeRelatedStructure() {
    // removing all related structure details
    var relatedStructure = this.quoteForm.get('relatedStructure').value;
    if (relatedStructure.length > 0) {
      // loop until all related structure details removed
      this.relatedStructure().removeAt(0);
      this.removeRelatedStructure();
    }
  }

  removeRelatedContent() {
    // removing all related content details
    var relatedContent = this.quoteForm.get('relatedContent').value;
    if (relatedContent.length > 0) {
      // loop until all related structure content removed
      this.relatedContent().removeAt(0);
      this.removeRelatedContent();
    }
  }

  newRelatedDetails(code: string, name: string): FormGroup {
    return this.fb.group({
      _value: ['', Validators.min(1)],
      _code: [code],
      _name: [name]
    });
  }

  getBlockNumber() {
    const _this = this;
    this.hls.getBlockNumber(this.homeDetails.district).then(res => {
      _this.LOV.blockNumberLOV = res;
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

  getZipCode() {
    const _this = this;
    this.homeAddress.city = this.homeDetails.city;
    this.tpls.getZipCode(this.homeAddress).then(res => {
      _this.LOV.zipCodeLOV = res;
      this.homeDetails.zipCode = null;
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
    let product = "";
    this.LOV.productListLOV.forEach((p) => {
      if (p.COD_MODALIDAD == this.homeDetails.product) {
        product = p.NOM_MODALIDAD;
      }
    });

    let payment = "";
    this.LOV.paymentMethodLOV.forEach((p) => {
      if (p.COD_FRACC_PAGO == this.homeDetails.paymentMethod) {
        payment = p.NOM_FRACC_PAGO;
      }
    });

    const modalData = {
      number: isPostPolicy ? this.homeDetails.policyNumber : this.homeDetails.quotationNumber,
      product: product,
      payment: payment,
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
