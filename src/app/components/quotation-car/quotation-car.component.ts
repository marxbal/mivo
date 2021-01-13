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
  Car
} from '../../objects/Car';
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
  AuthenticationService
} from '../../services/authentication.service';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig
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
import {
  ReturnDTO
} from 'src/app/objects/ReturnDTO';
import {
  Accessory
} from 'src/app/objects/Accessory';
import {
  LTOService
} from 'src/app/services/lto.service';
import {
  LTODetails
} from 'src/app/objects/LTODetails';

@Component({
  selector: 'app-quotation-car',
  templateUrl: './quotation-car.component.html',
  styleUrls: ['./quotation-car.component.css']
})
export class QuotationCarComponent implements OnInit, AfterViewChecked {
  @ViewChild(CoveragesComponent) appCoverage: CoveragesComponent;
  @ViewChild('proceedModal') proceedModal: TemplateRef < any > ;

  currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';
  triggerCounter: number = 0;
  triggerCoverage: number = 0;
  triggerBreakdown: number = 0;

  carDetails = new Car();
  prevCarDetails: Car = null;
  changedValues: any[] = [];
  changedAccessoryValues: any[] = [];

  hasRoadAssist = false;
  withTechControl = false;

  groupPolicy = new GroupPolicy();
  policyHolder = new PolicyHolder();
  secondaryPolicyHolder = new PolicyHolder();
  assigneePolicyHolder = new PolicyHolder();
  mortgageePolicyHolder = new PolicyHolder();
  coverageVariableData = new CoverageVariableData();

  quoteForm: FormGroup;
  // cForm: FormGroup;

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

  //allow user to edit the form
  editMode = true;

  //flag if coverage is modified
  isModifiedCoverage = false;
  //flag to include covergae
  includeCoverage = false;

  //flag to show generate btn
  showGenerateBtnGrp: boolean = true;
  //flag to show issue btn
  showIssueQuoteBtnGrp: boolean = false;
  //flag to show print quote/proceed to issuance
  showProceedToIssuanceBtnGrp: boolean = false;

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
    private cus: CarUtilityServices,
    private cls: CarLOVServices,
    private ltos: LTOService,
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
    this.loadInit();
    if (this.isIssuance) {
      this.pageLabel = 'Issuance';
      if (this.isLoadQuotation) {
        //if loaded from car quotation
        this.carDetails.quotationNumber = Globals.loadNumber;
        this.loadQuotation();
        Globals.setLoadNumber('');
        Globals.setLoadQuotation(false);
      }
    }
  }

  loadInit() {
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
      var list : any[] = [];
      this.cus.getSubagents().then(res => {
        var subAgents = res.obj["subAgents"];
        subAgents.forEach(subAgent => {
          var obj = {
            name: subAgent.nomCompleto + "(" + subAgent.tipDocum + ")",
            documentCode: subAgent.codDocum,
            documentType: subAgent.tipDocum,
            beneficiaryType: 20};
          list.push(obj);
        });
        _this.LOV.subagentLOV = list;
      });

      this.cls.getMortgageClause().then(res => {
        _this.LOV.mortgageClauseLOV = res;
      });
    }

    this.setDefaultValue();
  }

  setDefaultValue() {
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
      mvFileNumber: this.isIssuance ? ['', Validators.required] : [null],
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
      assuredsCoinsuranceShare: ['', Validators.max(100)],
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
      subAgents: [null],
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
    this.cqs.loadQuotation(this.carDetails.quotationNumber).then(res => {
      if (res.status) {
        this.manageBtn(2);
        const variableData = res.obj["variableData"] as any[];
        variableData.forEach(v => {
          const code = v.codCampo;
          const value: string = v.valCampo;
          let valueInt: number = undefined;
  
          try {
            valueInt = parseInt(value);
          } catch (e) {
            // do nothing
          }
  
          switch (code) {
            //risk details
            case "COD_MARCA": {
              this.carDetails.make = valueInt;
              break;
            }
            case "COD_MODELO": {
              this.carDetails.model = valueInt;
              break;
            }
            case "COD_TIP_VEHI": {
              this.carDetails.vehicleType = valueInt;
              break;
            }
            case "ANIO_SUB_MODELO": {
              this.carDetails.modelYear = value;
              break;
            }
            case "COD_SUB_MODELO": {
              this.carDetails.subModel = valueInt;
              break;
            }
            case "COD_USO_VEHI": {
              this.carDetails.typeOfUse = valueInt;
              break;
            }
            case "VAL_SUB_MODELO": {
              this.carDetails.vehicleValue = valueInt;
              break;
            }
  
            //vehicle information
            case "COD_COLOR": {
              this.carDetails.color = valueInt;
              break;
            }
            case "COD_AREA_USAGE": {
              this.carDetails.areaOfUsage = valueInt;
              break;
            }
            case "NUM_CONDUCTION": {
              this.carDetails.conductionNumber = value;
              break;
            }
            case "NUM_MATRICULA": {
              this.carDetails.plateNumber = value;
              break;
            }
            case "NUM_SERIAL": {
              this.carDetails.serialNumber = value;
              break;
            }
            case "NUM_MOTOR": {
              this.carDetails.engineNumber = value;
              break;
            }
            case "NUM_MV_FILE": {
              this.carDetails.mvFileNumber = value;
              break;
            }
            case "FEC_PURCHASE": {
              this.carDetails.purchaseDate = new Date(value);
              this.quoteForm.get('purchaseDate').markAsDirty();
              break;
            }
            case "NOM_RECEIVED_BY": {
              this.carDetails.receivedBy = value;
              break;
            }
            case "FEC_RECEIVED": {
              this.carDetails.receivedDate = new Date(value);
              this.quoteForm.get('receivedDate').markAsDirty();
              break;
            }
            case "NUM_PLAZAS": {
              this.carDetails.seatingCapacity = valueInt;
              break;
            }
            case "VAL_PESO": {
              this.carDetails.weight = value;
              break;
            }
            case "VAL_CC": {
              this.carDetails.displacement = value;
              break;
            }
            case "TIP_VEHI_PESO": {
              this.carDetails.classification = valueInt;
              break;
            }
            case "COD_AREA_COVER": {
              this.carDetails.coverageArea = valueInt;
              break;
            }
            case "PCT_CLI_COINS": {
              this.carDetails.assuredsCoinsuranceShare = value;
              break;
            }
            case "MCA_WAIVE_MIN_PREM": {
              this.carDetails.cbWaivedMinPremium = (value == 'S');
              break;
            }
            case "MCA_PREPAID_PREM": {
              this.carDetails.cbPrepaidPremium = (value == 'S');
              break;
            }
            case "MCA_GLASS_ETCHING": {
              this.carDetails.cbGlassEtchingEntitled = (value == 'S');
              break;
            }
            case "FEC_GLASS_ETCHING": {
              this.carDetails.glassEtchingAvailmentDate = new Date(value);
              break;
            }
            case "TXT_EXT_DAM_PARTS": {
              this.carDetails.existingDamages = value;
              break;
            }
            case "TIP_EXT_DAM_PARTS": {
              this.carDetails.inspectionAssessment = valueInt;
              break;
            }
  
            //additional policy information for issuance
            case "MCA_DRIVER": {
              this.carDetails.cbPolicyOnlyDriver = (value == 'S');
              break;
            }
            case "MCA_OWNER": {
              this.carDetails.cbPolicyOwner = (value == 'S');
              break;
            }
            case "MCA_ASSIGNEE": {
              this.carDetails.cbHasAssignee = (value == 'S');
              break;
            }
            case "MCA_MORTGAGED": {
              this.carDetails.cbVehicleMortgaged = (value == 'S');
              break;
            }
            case "TIP_MORT_CLAUSE": {
              this.carDetails.mortgageClause = valueInt;
              break;
            }

            case "NUM_COC": {
              this.carDetails.cocNumber = value;
              break;
            }
  
            case "COD_MODALIDAD": {
              this.carDetails.productList = valueInt;
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });
  
        const alternative = res.obj["alternative"] as any[];
        alternative.forEach(a => {
          const code = a.codCampo;
          const value: string = a.valCampo;
          const text: string = a.txtCampo;
  
          switch (code) {
            //risk details
            case "TIP_ASEG_SEP_LOV": {
              this.carDetails.secondaryPolicyHolderSeparator = text;
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });
  
        const generalInfo = res.obj["generalInfo"];
        this.carDetails.subline = generalInfo.codRamo;
        this.carDetails.sublineEffectivityDate = Utility.formatDate(new Date(generalInfo.fecValidez), "DDMMYYYY");
  
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
        this.carDetails.groupPolicy = this.groupPolicy;
  
        this.carDetails.effectivityDate = new Date(generalInfo.fecEfecPoliza);
        this.quoteForm.get('effectivityDate').markAsDirty();
        this.carDetails.expiryDate = new Date(generalInfo.fecVctoPoliza);
        this.quoteForm.get('expiryDate').markAsDirty();
  
        const docType = generalInfo.tipDocum;
        const docCode = generalInfo.codDocum;
        // preventing generic document type and code
        if ("MVO" != docType && !docCode.startsWith("MAPFREXX")) {
          this.policyHolder.documentType = docType;
          this.policyHolder.documentCode = docCode;
          this.policyHolder.isExisting = true;
        }
  
        this.carDetails.paymentMethod = generalInfo.codFraccPago;

        const beneficiary = res.obj["beneficiary"];
        const subAgentList = res.obj["subAgentList"];
        var subAgents : any[] = [];
        if (beneficiary.length) {
          beneficiary.forEach((ben: any) => {
            if (ben.tipBenef == 1) {
              this.secondaryPolicyHolder.documentCode = ben.codDocum;
              this.secondaryPolicyHolder.documentType = ben.tipDocum;
              this.secondaryPolicyHolder.isExisting = true;
            } else if (ben.tipBenef == 27) {
              this.showAssignee = true;
              this.assigneePolicyHolder.documentCode = ben.codDocum;
              this.assigneePolicyHolder.documentType = ben.tipDocum;
              this.assigneePolicyHolder.isExisting = true;
            } else if (ben.tipBenef == 8) {
              this.showMortgagee = true;
              this.mortgageePolicyHolder.documentCode = ben.codDocum;
              this.mortgageePolicyHolder.documentType = ben.tipDocum;
              this.mortgageePolicyHolder.isExisting = true;
            } else if (ben.tipBenef == 20) {
              var name = "";
              subAgentList.forEach(sa => {
                if (sa.tipDocum == ben.tipDocum && sa.codDocum == ben.codDocum) {
                  name = sa.nomCompleto + "(" + sa.tipDocum + ")";
                }
              });

              var obj = {name: name, documentCode: ben.codDocum, documentType: ben.tipDocum, beneficiaryType: 20};
              subAgents.push(obj);
            }
          });

          if (subAgents.length > 0) {
            this.carDetails.subAgents = subAgents;
          }
        }
  
        this.loadLOVs();
  
        const accessories = res.obj["accessories"];
        if (accessories.length) {
          //dispalys the accessory panel 
          this.showAccessories = true;
          //removes all accessories
          this.removeAccessories();
          var temp: any[] = [];
          accessories.forEach((acc: any) => {
            temp.push({
              accessory: acc.codAccesorio
            });
            this.accessory().push(this.loadAccessory(acc.codAccesorio, acc.nomAgrupAccesorio, acc.impAccesorio, acc.txtAccesorio));
          });
          const _this = this;
          this.cls.getAccessoryList(this.carDetails).then(res => {
            _this.LOV.accessoryListLOV = res;
            this.disableAccessory(temp);
          });
  
          var accessoriesForm = this.quoteForm.get('accessories').value;
          this.carDetails.accessories = accessoriesForm;
        } else {
          const _this = this;
          this.cls.getAccessoryList(this.carDetails).then(res => {
            _this.LOV.accessoryListLOV = res;
          });
          this.carDetails.accessories = [];
        }
  
        this.cqs.getCoverageByProduct(this.carDetails).then(res1 => {
          const coverageList = res1.obj["coverageList"];
          const amountList = res1.obj["amountList"];
          const premiumAmount = res.obj["premiumAmount"];
          const coverageVariable = res.obj["coverageVariable"];
          const coverageAmount = res.obj["coverageAmount"];
  
          this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
        });
  
        //breakdwon
        const breakdown = res.obj["breakdown"];
        const receipt = res.obj["receipt"];
        this.populatePaymentBreakdown(breakdown, receipt);
  
        //cloning details from load quotation
        const deepClone = JSON.parse(JSON.stringify(this.carDetails));
        this.prevCarDetails = deepClone;

        const technicalControl = res.obj["technicalControl"];
        if (generalInfo.mcaProvisional == "S" && technicalControl.length > 0) {
          this.withTechControl = true;
          this.modalRef = Utility.showError(this.bms, "Quotation has technical control. Please request for approval first before posting the policy.");
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.obj['message']);
        this.carDetails.quotationNumber = "";
      }
    }).finally(() => {
      //trigger child component load quotation function
      this.triggerCounter = this.triggerCounter + 1;
    });
  }

  //loading of all LOV's for load quotation
  loadLOVs() {
    var _this = this;
    //loading risk information
    this.quoteForm.get('make').markAsDirty();
    this.quoteForm.get('model').markAsDirty();
    this.cls.getModelList(this.carDetails).then(res => {
      _this.LOV.modelLOV = res;
    });

    this.quoteForm.get('vehicleType').markAsDirty();
    this.cls.getVehicleTypeList(this.carDetails).then(res => {
      _this.LOV.vehicleTypeLOV = res;
    });

    this.quoteForm.get('modelYear').markAsDirty();
    this.cls.getModelYearList(this.carDetails).then(res => {
      _this.LOV.modelYearLOV = res;
    });

    this.quoteForm.get('subModel').markAsDirty();
    this.cls.getSubModelList(this.carDetails).then(res => {
      _this.LOV.subModelLOV = res;
    });

    this.quoteForm.get('typeOfUse').markAsDirty();
    this.cls.getTypeOfUseList(this.carDetails).then(res => {
      _this.LOV.typeOfUseLOV = res;
    });

    this.quoteForm.get('subline').markAsDirty();
    // var qqDetails = new QQCar;
    // qqDetails.vehicleType = this.carDetails.vehicleType;
    // qqDetails.typeOfUse = this.carDetails.typeOfUse;
    // this.cus.getSubline(qqDetails).then(res => {
    this.cus.getSubline(this.carDetails).then(res => {
      _this.LOV.sublineLOV = res.obj["list"];
    });

    //loading vehicle information
    this.quoteForm.get('areaOfUsage').markAsDirty();
    this.cls.getAreaOfUsage(this.carDetails).then(res => {
      _this.LOV.areaOfUsageLOV = res;
    });

    this.cls.getRegistrationType().then(res => {
      _this.LOV.registrationTypeLOV = res;
    });

    this.cls.getMVType().then(res => {
      _this.LOV.mvTypeLOV = res;
    });

    this.quoteForm.get('paymentMethod').markAsDirty();
    this.cls.getPaymentPlan(this.carDetails).then(res => {
      _this.LOV.paymentMethodLOV = res;
    });

    this.quoteForm.get('product').markAsDirty();
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
  }

  setValidations() {
    var conductionNumber = this.quoteForm.get('conductionNumber');
    var plateNumber = this.quoteForm.get('plateNumber');
    var vehicleType = this.quoteForm.get('vehicleType');
    var cbIsNotRequiredAuthNumber = this.quoteForm.get('cbIsNotRequiredAuthNumber');
    var authNumber = this.quoteForm.get('authNumber');
    var quotationNumber = this.quoteForm.get('quotationNumber');
    var cbVehicleMortgaged = this.quoteForm.get('cbVehicleMortgaged');
    var mortgageClause = this.quoteForm.get('mortgageClause');

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

    // cbIsNotRequiredAuthNumber.valueChanges.pipe(distinctUntilChanged()).subscribe(bool => {
    //   Utility.updateValidator(authNumber, bool ? null : Validators.required);
    // });

    quotationNumber.valueChanges.subscribe(number => {
      this.disableLoadBtn = Utility.isUndefined(number);
    });

    cbVehicleMortgaged.valueChanges.subscribe(mortgaged => {
      Utility.updateValidator(mortgageClause, mortgaged ? Validators.required : null);
      this.carDetails.mortgageClause = mortgaged ? 1 : null;
    });
  }

  accessory(): FormArray {
    return this.quoteForm.get("accessories") as FormArray;
  }

  newAccessory(): FormGroup {
    return this.fb.group({
      accessory: ['', Validators.required],
      accessoryType: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  loadAccessory(accessory: number, accessoryType: string, price: number, description: string): FormGroup {
    return this.fb.group({
      accessory: [accessory, Validators.required],
      accessoryType: [accessoryType, Validators.required],
      price: [price, Validators.required],
      description: [description, Validators.required]
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

  disableAccessory(acc ? : any[]) {
    var accessories = Utility.isUndefined(acc) ? this.quoteForm.get('accessories').value : acc;
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
    //if user changes car make
    if (level <= 1) {
      this.LOV.modelLOV = [];
      this.carDetails.model = undefined;
      this.quoteForm.get('model').reset();
    }
    //if user changes car model
    if (level <= 2) {
      this.LOV.vehicleTypeLOV = [];
      this.carDetails.vehicleType = undefined;
      this.quoteForm.get('vehicleType').reset();
    }
    //if user changes vehicle type
    if (level <= 3) {
      this.LOV.modelYearLOV = [];
      this.carDetails.modelYear = undefined;
      this.quoteForm.get('modelYear').reset();
    }
    //if user changes car model year
    if (level <= 4) {
      this.LOV.subModelLOV = [];
      this.LOV.typeOfUseLOV = [];
      this.carDetails.subModel = undefined;
      this.carDetails.typeOfUse = undefined;
      this.quoteForm.get('subModel').reset();
      this.quoteForm.get('typeOfUse').reset();
    }
    //if user changes car sub model or type of use
    if (level <= 5) {
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
    // var qqDetails = new QQCar;
    // qqDetails.make = this.carDetails.make;
    // qqDetails.model = this.carDetails.model;
    // qqDetails.subModel = this.carDetails.subModel;
    // qqDetails.modelYear = this.carDetails.modelYear;
    // this.cus.getFMV(qqDetails).then(res => {
      this.cus.getFMV(this.carDetails).then(res => {
      _this.carDetails.vehicleValue = res.obj["fmv"];
    });
  }

  getSubline() {
    const _this = this;
    // var qqDetails = new QQCar;
    // qqDetails.vehicleType = this.carDetails.vehicleType;
    // qqDetails.typeOfUse = this.carDetails.typeOfUse;
    // this.cus.getSubline(qqDetails).then(res => {
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
    setTimeout(() => {
      this.carDetails.expiryDate = moment(this.carDetails.effectivityDate).add(1, 'years').toDate();
      this.expiryDateMinDate = this.carDetails.expiryDate;
    }, 500);
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

  cbIsNotRequiredAuthNumberChange() {
    var authNumber = this.quoteForm.get('authNumber');
    Utility.updateValidator(authNumber, this.carDetails.cbIsNotRequiredAuthNumber ? null : Validators.required);
  }

  authCOCRegistration() {
    const lto : LTODetails = new LTODetails; 

    var clientName = this.policyHolder.firstName + ' ' + this.policyHolder.lastName;
    var tinNumber = '000-000-000-000';
    if (this.policyHolder.documentType === 'TIN') {
      tinNumber = this.policyHolder.documentCode;
    }

    lto.assuredName = clientName;
    lto.assuredTin = tinNumber;

    lto.engineNumber = this.carDetails.engineNumber;
    lto.chassisNumber = this.carDetails.serialNumber;
    lto.mvFileNumber = this.carDetails.mvFileNumber;
    lto.plateNumber = this.carDetails.plateNumber;
    lto.cocNumber = this.carDetails.cocNumber;
    lto.inceptionDate = this.carDetails.effectivityDate;
    lto.expiryDate = this.carDetails.expiryDate;
    lto.regType = this.carDetails.registrationType;
    lto.subline = this.carDetails.subline;
    lto.vehicleType = this.carDetails.vehicleType;
    lto.typeOfUse = this.carDetails.typeOfUse;
    lto.mvType = this.carDetails.mvType;
    lto.classification = this.carDetails.classification;

    this.ltos.authenticateCOCRegistration(lto).then(res => {
      if (res.status) {
          var registrationMsg = res.obj['registrationMessage'];
          var verificationMsg = res.obj['verificationMessage'];
          
          var authNumber = registrationMsg.authNo;
          var registrationErrorMsg = registrationMsg.errorMessage;
          var verificationErrorMsg = verificationMsg.errorMessage;

          if (registrationErrorMsg !== null) {
            this.modalRef = Utility.showError(this.bms, registrationErrorMsg);
          } else {
            if (authNumber !== null) {
              this.carDetails.authNumber = registrationMsg.authNo;
              if (verificationErrorMsg !== null) {
                this.modalRef = Utility.showError(this.bms, verificationErrorMsg);
              }
            } else {
              this.modalRef = Utility.showWarning(this.bms, "Warning! No authentication number returned.");
            }
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
    this.triggerCoverage = this.triggerCoverage + 1;
    Utility.scroll('coverages');
  }

  populatePaymentBreakdown(breakdown: any[], receipt: {}) {
    this.paymentBreakdown = breakdown;
    this.paymentReceipt = receipt;
    this.showPaymentBreakdown = true;
    this.triggerBreakdown = this.triggerBreakdown + 1;
  }

  scrollTo(id: string) {
    Utility.scroll(id);
  }

  test(q: FormGroup, g: FormGroup, c: FormGroup) {
    let invalid = [];

    invalid = this.findInvalidControls(invalid, q);
    invalid = this.findInvalidControls(invalid, g);
    invalid = this.findInvalidControls(invalid, c);
    alert(invalid);
  }

  public findInvalidControls(invalid: any[], form: FormGroup) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
      if (controls[name].pristine) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  proceed(type: number) {
    //if user changes affecting values
    const hasAffectingAccessories = this.checkAffectingAccessories();
    const hasChanges = this.changedValues.length != 0 || hasAffectingAccessories;
    this.includeCoverage = !hasChanges;

    const hasQuotationNumber = !Utility.isUndefined(this.carDetails.quotationNumber);
    const isTemporaryQuotation = hasQuotationNumber && this.carDetails.quotationNumber.startsWith('999');
    this.carDetails.affecting = !hasQuotationNumber ||
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

  checkAffectingAccessories() {
    let hasAccessoryChanges = false;

    if (!Utility.isUndefined(this.prevCarDetails)) {
      this.changedAccessoryValues = [];

      var accessories = this.quoteForm.get('accessories').value;
      const length = accessories.length;
      let prevlength = 0;
      if ('accessories' in this.prevCarDetails) {
        const prevAccessories = this.prevCarDetails.accessories;
        prevlength = prevAccessories.length;
        if (prevlength != length) {
          if (prevlength > length) {
            var diff = prevlength - length;
            var label = diff == 1 ? " accessory" : " accessories";
            this.changedAccessoryValues.push(
              "Accessory: Deleted " + diff + label);
          } else {
            var diff = length - prevlength;
            var label = diff == 1 ? " accessory" : " accessories";
            this.changedAccessoryValues.push(
              "Accessory: Added " + diff + label);
          }
        }

        prevAccessories.forEach((acc : Accessory) => {
          let matched = false;
          accessories.forEach((acc1: Accessory) => {
            if (acc.accessory == acc1.accessory) {
              matched = true;
              if (acc.description != acc1.description) {
                this.changedAccessoryValues.push(
                  "Accessory Description: Changed " + acc.description + " to " + acc1.description);
              }
              if (acc.price != acc1.price) {
                this.changedAccessoryValues.push(
                  "Accessory Price: Changed " + acc.price + " to " + acc1.price);
              }
            }
          });
          if (!matched) {
            this.changedAccessoryValues.push(
              "Accessory: Changed Accessory List");
          }
        });
      }
      hasAccessoryChanges = this.changedAccessoryValues.length > 0;
    }

    return hasAccessoryChanges;
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

  openPaymentBreakdownModal(receipt: any, breakdown: any, isPostPolicy: boolean) {
    let product = "";
    this.LOV.productListLOV.forEach((p) => {
      if (p.COD_MODALIDAD == this.carDetails.productList) {
        product = p.NOM_MODALIDAD;
      }
    });

    let payment = "";
    this.LOV.paymentMethodLOV.forEach((p) => {
      if (p.COD_FRACC_PAGO == this.carDetails.paymentMethod) {
        payment = p.NOM_FRACC_PAGO;
      }
    });

    const modalData = {
      number: isPostPolicy ? this.carDetails.policyNumber : this.carDetails.quotationNumber,
      product: product,
      payment: payment,
      receipt: receipt,
      breakdown: breakdown,
      showExchangeRate: false,
      isPostPolicy: isPostPolicy,
      line: 'CAR'
    };

    this.dialog.open(PaymentBreakdownModalComponent, {
      width: '1000px',
      data: modalData
    });
  }

  manageBtn(opt: number, isModified ? : boolean) {
    if (opt == 1) {
      //hides payment breakdown panel
      this.showPaymentBreakdown = false;

      // flag to edit coverage
      const modified = !Utility.isUndefined(isModified);

      this.editMode = !modified;
      this.showCoverage = modified;
      this.isModifiedCoverage = modified;
      if (modified) {
        Utility.scroll('coverages');
      }
    }

    if (this.isIssuance) {
      this.showIssuanceGenerateBtn = (opt == 1);
      this.showSaveBtn = (opt == 2);
      this.showPostBtn = (opt == 3);
      this.showPrintBtn = (opt == 4);
    } else {
      this.showGenerateBtnGrp = (opt == 1);
      this.showIssueQuoteBtnGrp = (opt == 2);
      this.showProceedToIssuanceBtnGrp = (opt == 3);
    }
  }

  newQuote() {
    this.newPage(page.QUO.CAR);
  }

  newPolicy() {
    this.newPage(page.ISS.CAR);
  }

  newPage(page : string) {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page);
      this.router.navigate(['/reload']);
    }, 500);
  }

  affecting(key: string, label: string) {
    if (!Utility.isUndefined(this.carDetails.quotationNumber) && this.prevCarDetails != null) {
      let prev = this.prevCarDetails[key] == undefined ? "" : this.prevCarDetails[key];
      let curr = this.carDetails[key] == undefined ? "" : this.carDetails[key];
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
    this.cqs.printQuote(this.carDetails.quotationNumber);
  }

  printPolicy() {
    this.cqs.printPolicy(this.carDetails.policyNumber);
  }

  proceedToIssuance() {
    this.cqs.proceedToIssuance(this.carDetails.quotationNumber);
  }

  //generate and issue quote button
  issueQuote(mcaTmpPptoMph: string) {
    // S for generation and N for issue quotation
    this.carDetails.mcaTmpPptoMph = mcaTmpPptoMph;
    this.carDetails.isModifiedCoverage = this.isModifiedCoverage;

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
    if (!Utility.isUndefined(this.appCoverage) && (this.carDetails.isModifiedCoverage || this.includeCoverage)) {
      var coverages = this.appCoverage.cForm.get('coverages').value;
      this.carDetails.coverages = coverages.length ? coverages : [];
    }

    // to trigger changes when regenerating quotation
    this.showPaymentBreakdown = false;
    this.showCoverage = false;

    this.cqs.getCoverageByProduct(this.carDetails).then(res => {
      this.cqs.issueQuote(this.carDetails).then(res1 => {
        if (res1.status) {
          //clear affecting fields
          this.changedValues = [];

          const items = this.getErrorItems(res1, mcaTmpPptoMph, false);
          const status = res1.obj["status"];
          const coverageAmount = res1.obj["coverageAmount"];
          if (status && coverageAmount.length) {
            //duplicating car details for comparison
            const deepClone = JSON.parse(JSON.stringify(this.carDetails));
            this.prevCarDetails = deepClone;

            this.editMode = false;
            this.hasRoadAssist = res1.obj["hasRoadAssist"];
            const errorCode = res1.obj["errorCode"];
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
              const amountList = res.obj["amountList"];
              const premiumAmount = res1.obj["premiumAmount"];
              const coverageVariable = res1.obj["coverageVariable"];

              this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
              // if (this.isModifiedCoverage) {
              //   this.showCoverage = true;
              // } else {
              //   this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
              // }

              this.isModifiedCoverage = false;
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
          this.modalRef = Utility.showError(this.bms, res1.message);
        }
      });
    });
  }

  assembleIssuePolicyData() {
    // always N for issue policy
    this.carDetails.mcaTmpPptoMph = "N";
    this.carDetails.isModifiedCoverage = this.isModifiedCoverage;

    // includes group policy to car details DTO
    this.carDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to car details DTO
    this.carDetails.policyHolder = this.policyHolder;
    // includes secondary policy holder to car details DTO
    this.carDetails.secondaryPolicyHolder = this.secondaryPolicyHolder;
    // includes assignee policy holder to car details DTO
    this.carDetails.assigneePolicyHolder = this.assigneePolicyHolder;
    // includes mortgagee policy holder to car details DTO
    this.carDetails.mortgageePolicyHolder = this.mortgageePolicyHolder;
    // includes coverage variable data to car details DTO
    this.carDetails.coverageVariableData = this.coverageVariableData;

    // includes accessories to car details DTO
    var accessories = this.quoteForm.get('accessories').value;
    this.carDetails.accessories = accessories.length ? accessories : [];

    // includes coverages to car details DTO
    this.carDetails.coverages = [];
    if (!Utility.isUndefined(this.appCoverage) && (this.carDetails.isModifiedCoverage || this.includeCoverage)) {
      var coverages = this.appCoverage.cForm.get('coverages').value;
      this.carDetails.coverages = coverages.length ? coverages : [];
    }
  }

  //getting error or warning items
  getErrorItems(res1: ReturnDTO, mcaTmpPptoMph: string, isIssuance: boolean) {
    this.withTechControl = false;
    const resCoverageAmount = res1.obj["coverageAmount"];
    const resErrorCode = res1.obj["errorCode"];
    const resError = res1.obj["error"];

    const coverageAmountIsUndefined = Utility.isUndefined(resCoverageAmount);
    const isPostPolicy = coverageAmountIsUndefined && Utility.isUndefined(resErrorCode);
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

        const resStatus = res1.obj["status"];
        if (arr.length) {
          if (!resStatus && (isPostPolicy || (coverageAmountIsUndefined && !resCoverageAmount.length))) {
            //has error - can't proceed
            items = ["Failed to generate quotation number due to following reason/s:"].concat(arr);
          } else {
            this.withTechControl = true;
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

  //save policy button
  savePolicy() {
    this.assembleIssuePolicyData();

    // to trigger changes when regenerating quotation
    this.showCoverage = false;
    this.showPaymentBreakdown = false;

    this.cqs.getCoverageByProduct(this.carDetails).then(res => {
      this.cqs.savePolicy(this.carDetails).then(res1 => {
        if (res1.status) {
          //clear affecting fields
          this.changedValues = [];

          var items = this.getErrorItems(res1, this.carDetails.mcaTmpPptoMph, true);
          const status = res1.obj["status"];
          const coverageAmount = res1.obj["coverageAmount"];
          if (status && coverageAmount.length) {
            //duplicating car details for comparison
            const deepClone = JSON.parse(JSON.stringify(this.carDetails));
            this.prevCarDetails = deepClone;

            this.editMode = false;

            this.hasRoadAssist = res1.obj["hasRoadAssist"];

            const errorCode = res1.obj["errorCode"];
            const policyNumber = res1.obj["policyNumber"];
            this.carDetails.quotationNumber = policyNumber;

            const message = "You have successfully generated a new quotation: " + policyNumber;
            this.modalRef = Utility.showInfo(this.bms, message);

            const coverageList = res.obj["coverageList"];
            const amountList = res.obj["amountList"];
            const premiumAmount = res1.obj["premiumAmount"];
            const coverageVariable = res1.obj["coverageVariable"];

            this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
            this.isModifiedCoverage = false;

            const breakdown = res1.obj["breakdown"];
            const receipt = res1.obj["receipt"];
            this.populatePaymentBreakdown(breakdown, receipt);

            if (errorCode == "S") {
              //if quotation has a warning
              if (this.carDetails.affecting) {
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
          this.modalRef = Utility.showError(this.bms, res1.message);
        }
      });
    });
  }

  //post policy button
  postPolicy() {
    this.assembleIssuePolicyData();

    // hides coverage and payment breakdown
    this.showCoverage = false;
    this.showPaymentBreakdown = false;

    if (this.withTechControl) {
      this.modalRef = Utility.showWarning(this.bms, "Quotation has technical control. Please request for approval first before posting the policy.");
    } else {
      this.cqs.postPolicy(this.carDetails).then(res1 => {
        if (res1.status) {
          //clear affecting fields
          this.changedValues = [];

          var items = this.getErrorItems(res1, this.carDetails.mcaTmpPptoMph, true);
          const status = res1.obj["status"];
          const policyNumber = res1.obj["policyNumber"];
          if (status && !Utility.isUndefined(policyNumber)) {
            this.editMode = false;
            this.carDetails.policyNumber = policyNumber;

            this.isModifiedCoverage = false;
            const breakdown = res1.obj["breakdown"];
            const receipt = res1.obj["receipt"];
            this.populatePaymentBreakdown(breakdown, receipt);
            this.openPaymentBreakdownModal(receipt, breakdown, true);
            this.manageBtn(4);
          } else {
            this.modalRef = Utility.showHTMLError(this.bms, items);
          }
        } else {
          this.modalRef = Utility.showError(this.bms, res1.message);
        }
      });
    }
  }
}