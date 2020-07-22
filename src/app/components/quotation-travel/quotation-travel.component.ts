import {
  Component,
  OnInit,
  Input,
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
import * as moment from 'moment';
import {
  Travel
} from '../../objects/Travel';
import {
  GroupPolicy
} from 'src/app/objects/GroupPolicy';
import {
  Utility
} from '../../utils/utility';
import {
  TravelListObject
} from 'src/app/objects/LOV/travelList';
import {
  GroupPolicyListObject
} from 'src/app/objects/LOV/groupPolicyList';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import {
  BsModalService,
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  PaymentBreakdownModalComponent
} from '../payment-breakdown-modal/payment-breakdown-modal.component';
import {
  Router
} from '@angular/router';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig
} from '@angular/material';
import {
  Globals
} from 'src/app/utils/global';
import {
  page
} from 'src/app/constants/page';
import {
  CoveragesComponent
} from '../coverages/coverages.component';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  TravelLOVServices
} from '../../services/lov/travel.service'
import {
  TravelUtilityServices
} from 'src/app/services/travel-utility.service';
import {
  TravelIssueServices
} from 'src/app/services/travel-issue.service';
import {
  validateItinerary
} from 'src/app/validators/validate';
import {
  ReturnDTO
} from 'src/app/objects/ReturnDTO';
import {
  Traveller
} from 'src/app/objects/Traveller';

@Component({
  selector: 'app-quotation-travel',
  templateUrl: './quotation-travel.component.html',
  styleUrls: ['./quotation-travel.component.css']
})
export class QuotationTravelComponent implements OnInit, AfterViewChecked {
  @ViewChild(CoveragesComponent) appCoverage: CoveragesComponent;
  @ViewChild('proceedModal') proceedModal: TemplateRef < any > ;
  @ViewChild('validationModal') validationModal: TemplateRef < any > ;

  currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';
  triggerCounter: number = 0;
  triggerCoverage: number = 0;
  travellerHeadCount: number = 1;

  travelDetails = new Travel();
  prevTravelDetails: Travel = null;
  changedValues: any[] = [];
  changedTravellerValues: any[] = [];

  invalidForms: any[] = [];

  withTechControl = false;

  groupPolicy = new GroupPolicy();
  policyHolder = new PolicyHolder();

  quoteForm: FormGroup;

  mindate: Date = new Date();
  // bdaymindate: Date = moment().subtract(65, 'years').toDate();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();
  endDateMinDate: Date = moment().add(1, 'days').toDate();
  enableEndDate: boolean = false;

  LOV = new TravelListObject();
  GPLOV = new GroupPolicyListObject();

  showOthersDescription: boolean = false;
  showAdditionalInformation: boolean = false;
  showPaymentBreakdown: boolean = false;
  showCoverage: boolean = false;

  //for payment breakdown
  paymentBreakdown: any[];
  paymentReceipt: {};

  //for coverage
  coverageList: any[];

  //allow user to edit the form
  editMode = true;

  //flag if coverage is modified
  // isModifiedCoverage = false;
  //flag to include covergae
  // includeCoverage = false;

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
    private auths: AuthenticationService,
    private bms: BsModalService,
    private router: Router,
    private tls: TravelLOVServices,
    private tus: TravelUtilityServices,
    private tis: TravelIssueServices,
    public dialog: MatDialog,
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
        //if loaded from car quotation
        this.travelDetails.quotationNumber = Globals.loadNumber;
        // this.loadQuotation();
        Globals.setLoadNumber('');
        Globals.setLoadQuotation(false);
      }
    }
  }

  loadInit() {
    var _this = this;
    this.tls.getCurrencyList().then(res => {
      _this.LOV.currencyLOV = res;
    });
    this.tls.getTravelPackage().then(res => {
      _this.LOV.packageLOV = res;
    });
    this.tls.getTypeOfCoverage().then(res => {
      _this.LOV.coverageLOV = res;
    });
    this.tls.getPurposeOfTrip().then(res => {
      _this.LOV.purposeOfTripLOV = res;
      _this.LOV.purposeOfTripLOV.forEach((p) => {
        var businessLabel = p.NOM_BUSINESS as string;
        p.COD_BUSINESS = businessLabel.toUpperCase();
      });
    });
    this.tls.getInsuranceCoverage().then(res => {
      _this.LOV.insuranceCoverageLOV = res;
    });
    this.tls.getCoverageOption().then(res => {
      _this.LOV.coverageOptionLOV = res;
    });
    this.tls.getRelationship().then(res => {
      _this.LOV.relationshipLOV = res;
      _this.LOV.relationshipLOV.forEach((r) => {
        // disable primary
        r.disabled = r.COD_VALOR == 'P';
      });
    });

    //setting defualt value
    this.travelDetails.insuranceCoverage = "I"; //individual
  }

  createQuoteForm() {
    this.quoteForm = this.fb.group({
      quotationNumber: [null],
      currency: ['', Validators.required],
      country: ['', Validators.required],
      //general information
      travelPackage: ['', Validators.required],
      travelType: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      noOfDays: ['', Validators.required],
      completeItinerary: ['', [Validators.required, validateItinerary]],
      purposeOfTrip: ['', Validators.required],
      cbOneTripOnly: ['', Validators.required],
      cbWithCruise: [null],
      othersDescription: [null],
      //travellers
      travellers: this.fb.array([this.newTraveller(true)]),
      //additional policy information
      cbSportsEquipment: [null],
      sportsEquipment: [null],
      cbHazardousSports: [null],
      hazardousSports: [null],
      //coverages
      insuranceCoverage: ['', Validators.required],
      coverageOption: ['', Validators.required],
      medicalExpenses: ['', Validators.required],
    });
  }

  currencyOnchange() {
    var _this = this;

    this.travelDetails.subline = 380;
    this.travelDetails.startDate = null;
    this.travelDetails.endDate = null;

    //if currency is philippine peso
    this.travelDetails.country = this.travelDetails.currency === 1 ? [{
        NOM_PAIS: "PHILIPPINES",
        COD_PAIS: "PHL",
        NOM_VERNACULO: "PHILIPPINES",
        name: "PHILIPPINES",
        value: "PHL",
        type: "PHILIPPINES"
      }] :
      null;
    this.travelDetails.travelPackage = this.travelDetails.currency === 1 ?
      "P" :
      null;

    this.tls.getCountryList(this.travelDetails).then(res => {
      res.forEach(country => {
        country.name = country.NOM_PAIS;
        country.value = country.COD_PAIS;
        country.type = country.NOM_VERNACULO;
      });
      _this.LOV.countryLOV = res;
    });

    this.tls.getProduct(this.travelDetails).then(res => {
      _this.LOV.productListLOV = res;
    });
  }

  relationshipOnChange(traveller: FormGroup) {
    var val = traveller.controls['relationship'].value;
    var maxAge = (val == 'C') ? 21 : 65;
    const bdaymindate: Date = moment().subtract(maxAge, 'years').toDate();
    traveller.controls['bdaymindate'].setValue(bdaymindate);

    this.LOV.relationshipLOV.forEach(r => {
      if (r.COD_VALOR == val) {
        traveller.controls['relationshipLabel'].setValue(r.NOM_VALOR);
      }
    });
  }

  getOneTrip() {
    if (this.travelDetails.endDate != null) {
      this.tus.getOneTrip(this.travelDetails).then((res) => {
        if (res.status) {
          this.travelDetails.cbOneTripOnly = res.obj['oneTripOnly'] as boolean;
        }
      });
    }
  }

  loadQuotation() {
    // this.cqs.loadQuotation(this.carDetails.quotationNumber).then(res => {
    //   if (res.status) {
    //     this.manageBtn(2);
    //     const variableData = res.obj["variableData"] as any[];
    //     variableData.forEach(v => {
    //       const code = v.codCampo;
    //       const value: string = v.valCampo;
    //       let valueInt: number = undefined;
  
    //       try {
    //         valueInt = parseInt(value);
    //       } catch (e) {
    //         // do nothing
    //       }
  
    //       switch (code) {
    //         //risk details
    //         case "COD_MARCA": {
    //           this.carDetails.make = valueInt;
    //           break;
    //         }
    //         case "COD_MODELO": {
    //           this.carDetails.model = valueInt;
    //           break;
    //         }
    //         case "COD_TIP_VEHI": {
    //           this.carDetails.vehicleType = valueInt;
    //           break;
    //         }
    //         case "ANIO_SUB_MODELO": {
    //           this.carDetails.modelYear = value;
    //           break;
    //         }
    //         case "COD_SUB_MODELO": {
    //           this.carDetails.subModel = valueInt;
    //           break;
    //         }
    //         case "COD_USO_VEHI": {
    //           this.carDetails.typeOfUse = valueInt;
    //           break;
    //         }
    //         case "VAL_SUB_MODELO": {
    //           this.carDetails.vehicleValue = valueInt;
    //           break;
    //         }
  
    //         //vehicle information
    //         case "COD_COLOR": {
    //           this.carDetails.color = valueInt;
    //           break;
    //         }
    //         case "COD_AREA_USAGE": {
    //           this.carDetails.areaOfUsage = valueInt;
    //           break;
    //         }
    //         case "NUM_CONDUCTION": {
    //           this.carDetails.conductionNumber = value;
    //           break;
    //         }
    //         case "NUM_MATRICULA": {
    //           this.carDetails.plateNumber = value;
    //           break;
    //         }
    //         case "NUM_SERIAL": {
    //           this.carDetails.serialNumber = value;
    //           break;
    //         }
    //         case "NUM_MOTOR": {
    //           this.carDetails.engineNumber = value;
    //           break;
    //         }
    //         case "NUM_MV_FILE": {
    //           this.carDetails.mvFileNumber = value;
    //           break;
    //         }
    //         case "FEC_PURCHASE": {
    //           this.carDetails.purchaseDate = new Date(value);
    //           this.quoteForm.get('purchaseDate').markAsDirty();
    //           break;
    //         }
    //         case "NOM_RECEIVED_BY": {
    //           this.carDetails.receivedBy = value;
    //           break;
    //         }
    //         case "FEC_RECEIVED": {
    //           this.carDetails.receivedDate = new Date(value);
    //           this.quoteForm.get('receivedDate').markAsDirty();
    //           break;
    //         }
    //         case "NUM_PLAZAS": {
    //           this.carDetails.seatingCapacity = valueInt;
    //           break;
    //         }
    //         case "VAL_PESO": {
    //           this.carDetails.weight = value;
    //           break;
    //         }
    //         case "VAL_CC": {
    //           this.carDetails.displacement = value;
    //           break;
    //         }
    //         case "TIP_VEHI_PESO": {
    //           this.carDetails.classification = valueInt;
    //           break;
    //         }
    //         case "COD_AREA_COVER": {
    //           this.carDetails.coverageArea = valueInt;
    //           break;
    //         }
    //         case "PCT_CLI_COINS": {
    //           this.carDetails.assuredsCoinsuranceShare = value;
    //           break;
    //         }
    //         case "MCA_WAIVE_MIN_PREM": {
    //           this.carDetails.cbWaivedMinPremium = (value == 'S');
    //           break;
    //         }
    //         case "MCA_PREPAID_PREM": {
    //           this.carDetails.cbPrepaidPremium = (value == 'S');
    //           break;
    //         }
    //         case "MCA_GLASS_ETCHING": {
    //           this.carDetails.cbGlassEtchingEntitled = (value == 'S');
    //           break;
    //         }
    //         case "FEC_GLASS_ETCHING": {
    //           this.carDetails.glassEtchingAvailmentDate = new Date(value);
    //           break;
    //         }
    //         case "TXT_EXT_DAM_PARTS": {
    //           this.carDetails.existingDamages = value;
    //           break;
    //         }
    //         case "TIP_EXT_DAM_PARTS": {
    //           this.carDetails.inspectionAssessment = valueInt;
    //           break;
    //         }
  
    //         //additional policy information for issuance
    //         case "MCA_DRIVER": {
    //           this.carDetails.cbPolicyOnlyDriver = (value == 'S');
    //           break;
    //         }
    //         case "MCA_OWNER": {
    //           this.carDetails.cbPolicyOwner = (value == 'S');
    //           break;
    //         }
    //         case "MCA_ASSIGNEE": {
    //           this.carDetails.cbHasAssignee = (value == 'S');
    //           break;
    //         }
    //         case "MCA_MORTGAGED": {
    //           this.carDetails.cbVehicleMortgaged = (value == 'S');
    //           break;
    //         }
    //         case "TIP_MORT_CLAUSE": {
    //           this.carDetails.mortgageClause = valueInt;
    //           break;
    //         }
  
    //         case "COD_MODALIDAD": {
    //           this.carDetails.productList = valueInt;
    //           break;
    //         }
  
    //         default: {
    //           // do nothing
    //         }
    //       }
    //     });
  
    //     const alternative = res.obj["alternative"] as any[];
    //     alternative.forEach(a => {
    //       const code = a.codCampo;
    //       const value: string = a.valCampo;
    //       const text: string = a.txtCampo;
    //       let valueInt: number = undefined;
  
    //       try {
    //         valueInt = parseInt(value);
    //       } catch (e) {
    //         // do nothing
    //       }
  
    //       switch (code) {
    //         //risk details
    //         case "TIP_ASEG_SEP_LOV": {
    //           this.carDetails.secondaryPolicyHolderSeparator = text;
    //           break;
    //         }
  
    //         default: {
    //           // do nothing
    //         }
    //       }
    //     });
  
    //     const generalInfo = res.obj["generalInfo"];
    //     this.carDetails.subline = generalInfo.codRamo;
    //     this.carDetails.sublineEffectivityDate = Utility.formatDate(new Date(generalInfo.fecValidez), "DDMMYYYY");
  
    //     this.groupPolicy.agentCode = generalInfo.codAgt;
    //     this.groupPolicy.groupPolicy = generalInfo.numPolizaGrupo;
    //     this.groupPolicy.contract = generalInfo.numSubcontrato;
    //     this.groupPolicy.subContract = generalInfo.numSubcontrato;
    //     this.groupPolicy.commercialStructure = generalInfo.codNivel3;
    //     this.carDetails.groupPolicy = this.groupPolicy;
  
    //     this.carDetails.effectivityDate = new Date(generalInfo.fecEfecPoliza);
    //     this.quoteForm.get('effectivityDate').markAsDirty();
    //     this.carDetails.expiryDate = new Date(generalInfo.fecVctoPoliza);
    //     this.quoteForm.get('expiryDate').markAsDirty();
  
    //     const docType = generalInfo.tipDocum;
    //     const docCode = generalInfo.codDocum;
    //     // preventing generic document type and code
    //     if ("MVO" != docType && !docCode.startsWith("MAPFREXX")) {
    //       this.policyHolder.documentType = docType;
    //       this.policyHolder.documentCode = docCode;
    //       this.policyHolder.isExisting = true;
    //     }
  
    //     this.carDetails.paymentMethod = generalInfo.codFraccPago;
  
    //     const beneficiary = res.obj["beneficiary"];
    //     if (beneficiary.length) {
    //       beneficiary.forEach((ben: any) => {
    //         if (ben.tipBenef == 1) {
    //           this.secondaryPolicyHolder.documentCode = ben.codDocum;
    //           this.secondaryPolicyHolder.documentType = ben.tipDocum;
    //           this.secondaryPolicyHolder.isExisting = true;
    //         } else if (ben.tipBenef == 27) {
    //           this.showAssignee = true;
    //           this.assigneePolicyHolder.documentCode = ben.codDocum;
    //           this.assigneePolicyHolder.documentType = ben.tipDocum;
    //           this.assigneePolicyHolder.isExisting = true;
    //         } else if (ben.tipBenef == 8) {
    //           this.showMortgagee = true;
    //           this.mortgageePolicyHolder.documentCode = ben.codDocum;
    //           this.mortgageePolicyHolder.documentType = ben.tipDocum;
    //           this.mortgageePolicyHolder.isExisting = true;
    //         }
    //       });
    //     }
  
    //     this.loadLOVs();
  
    //     const accessories = res.obj["accessories"];
    //     if (accessories.length) {
    //       //dispalys the accessory panel 
    //       this.showAccessories = true;
    //       //removes all accessories
    //       this.removeAccessories();
    //       var temp: any[] = [];
    //       accessories.forEach((acc: any) => {
    //         temp.push({
    //           accessory: acc.codAccesorio
    //         });
    //         this.accessory().push(this.loadAccessory(acc.codAccesorio, acc.nomAgrupAccesorio, acc.impAccesorio, acc.txtAccesorio));
    //       });
    //       const _this = this;
    //       this.cls.getAccessoryList(this.carDetails).then(res => {
    //         _this.LOV.accessoryListLOV = res;
    //         this.disableAccessory(temp);
    //       });
  
    //       var accessoriesForm = this.quoteForm.get('accessories').value;
    //       this.carDetails.accessories = accessoriesForm;
    //     } else {
    //       const _this = this;
    //       this.cls.getAccessoryList(this.carDetails).then(res => {
    //         _this.LOV.accessoryListLOV = res;
    //       });
    //       this.carDetails.accessories = [];
    //     }
  
    //     this.cqs.getCoverageByProduct(this.carDetails).then(res1 => {
    //       const coverageList = res1.obj["coverageList"];
    //       const amountList = res1.obj["amountList"];
    //       const premiumAmount = res.obj["premiumAmount"];
    //       const coverageVariable = res.obj["coverageVariable"];
    //       const coverageAmount = res.obj["coverageAmount"];
  
    //       this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
    //     });
  
    //     //breakdwon
    //     const breakdown = res.obj["breakdown"];
    //     const receipt = res.obj["receipt"];
    //     this.populatePaymentBreakdown(breakdown, receipt);
  
    //     //cloning details from load quotation
    //     const deepClone = JSON.parse(JSON.stringify(this.carDetails));
    //     this.prevCarDetails = deepClone;

    //     const technicalControl = res.obj["technicalControl"];
    //     if (generalInfo.mcaProvisional == "S" && technicalControl.length > 0) {
    //       this.withTechControl = true;
    //       this.modalRef = Utility.showError(this.bms, "Quotation has technical control. Please request for approval first before posting the policy.");
    //     }
    //   } else {
    //     this.modalRef = Utility.showError(this.bms, res.obj['message']);
    //     this.carDetails.quotationNumber = "";
    //   }
    // }).finally(() => {
    //   //trigger child component load quotation function
    //   this.triggerCounter = this.triggerCounter + 1;
    // });
  }

  //loading of all LOV's for load quotation
  loadLOVs() {
    // var _this = this;
    // //loading risk information
    // this.quoteForm.get('make').markAsDirty();
    // this.quoteForm.get('model').markAsDirty();
    // this.cls.getModelList(this.carDetails).then(res => {
    //   _this.LOV.modelLOV = res;
    // });

    // this.quoteForm.get('vehicleType').markAsDirty();
    // this.cls.getVehicleTypeList(this.carDetails).then(res => {
    //   _this.LOV.vehicleTypeLOV = res;
    // });

    // this.quoteForm.get('modelYear').markAsDirty();
    // this.cls.getModelYearList(this.carDetails).then(res => {
    //   _this.LOV.modelYearLOV = res;
    // });

    // this.quoteForm.get('subModel').markAsDirty();
    // this.cls.getSubModelList(this.carDetails).then(res => {
    //   _this.LOV.subModelLOV = res;
    // });

    // this.quoteForm.get('typeOfUse').markAsDirty();
    // this.cls.getTypeOfUseList(this.carDetails).then(res => {
    //   _this.LOV.typeOfUseLOV = res;
    // });

    // this.quoteForm.get('subline').markAsDirty();
    // var qqDetails = new QQCar;
    // qqDetails.vehicleType = this.carDetails.vehicleType;
    // qqDetails.typeOfUse = this.carDetails.typeOfUse;
    // this.cus.getSubline(qqDetails).then(res => {
    //   _this.LOV.sublineLOV = res.obj["list"];
    // });

    // //loading vehicle information
    // this.quoteForm.get('areaOfUsage').markAsDirty();
    // this.cls.getAreaOfUsage(this.carDetails).then(res => {
    //   _this.LOV.areaOfUsageLOV = res;
    // });

    // this.cls.getRegistrationType().then(res => {
    //   _this.LOV.registrationTypeLOV = res;
    // });

    // this.cls.getMVType().then(res => {
    //   _this.LOV.mvTypeLOV = res;
    // });

    // this.quoteForm.get('paymentMethod').markAsDirty();
    // this.cls.getPaymentPlan(this.carDetails).then(res => {
    //   _this.LOV.paymentMethodLOV = res;
    // });

    // this.quoteForm.get('product').markAsDirty();
    // this.cls.getProduct(this.carDetails).then(res => {
    //   let avalidableProducts = [];
    //   res.forEach((e) => {
    //     //removing not MSO products
    //     if (e.COD_MODALIDAD != 10011 && e.COD_MODALIDAD != 10010) {
    //       avalidableProducts.push(e);
    //     }
    //   });
    //   _this.LOV.productListLOV = avalidableProducts;
    // });
  }

  setValidations() {
    var endDate = this.quoteForm.get('endDate');
    var startDate = this.quoteForm.get('startDate');
    var country = this.quoteForm.get('country');
    var purposeOfTrip = this.quoteForm.get('purposeOfTrip');
    var othersDescription = this.quoteForm.get('othersDescription');

    var cbSportsEquipment = this.quoteForm.get('cbSportsEquipment');
    var sportsEquipment = this.quoteForm.get('sportsEquipment');
    var cbHazardousSports = this.quoteForm.get('cbHazardousSports');
    var hazardousSports = this.quoteForm.get('hazardousSports');

    var quotationNumber = this.quoteForm.get('quotationNumber');

    endDate.valueChanges.subscribe(date => {
      var diff = moment(date).diff(moment(startDate.value), 'days') + 1;
      this.travelDetails.noOfDays = diff >= 2 ? diff : 0;
    });

    startDate.valueChanges.subscribe(date => {
      this.enableEndDate = date !== null && date !== undefined;

      var diff = 0;
      if (this.enableEndDate) {
        var diff = moment(endDate.value).diff(moment(date), 'days') + 1;
        diff = diff === NaN ? 0 : diff;
        this.endDateMinDate = moment(date).add(1, 'days').toDate();
        if (diff < 1) {
          this.travelDetails.endDate = null;
        }
      } else {
        this.travelDetails.endDate = null;
      }

      this.travelDetails.noOfDays = diff >= 2 ? diff : 0;
    });

    country.valueChanges.subscribe(countries => {
      var packageList = [];
      if (!Utility.isUndefined(countries)) {
        countries.forEach(country => {
          packageList.push(country.type);
        });
        if (packageList.indexOf("WORLD") !== -1) {
          this.travelDetails.travelPackage = "W";
          this.travelDetails.travelType = "I";
        } else if (packageList.indexOf("SCHENGEN") !== -1) {
          this.travelDetails.travelPackage = "S";
          this.travelDetails.travelType = "I";
        } else if (packageList.indexOf("ASIA") !== -1) {
          this.travelDetails.travelPackage = "A";
          this.travelDetails.travelType = "I";
        } else {
          this.travelDetails.travelPackage = "P";
          this.travelDetails.travelType = "D";
          this.travelDetails.cbWithCruise = false;
        }

        var _this = this;
        this.tls.getExpensesCoverage(this.travelDetails).then((res) => {
          _this.LOV.medicalExpensesLOV = res;
        });
      }
    });

    purposeOfTrip.valueChanges.subscribe(trip => {
      //if purpose of trip is others, show the others desctiption input and make it required
      this.showOthersDescription = (trip == 'OTHERS');
      Utility.updateValidator(othersDescription, trip == 'OTHERS' ? [Validators.required] : null);
    }); 

    cbSportsEquipment.valueChanges.subscribe(checked => {
      this.travelDetails.sportsEquipment = Utility.setNull(checked, this.travelDetails.sportsEquipment);
      Utility.updateValidator(sportsEquipment, checked ? [Validators.required] : null);
    });

    cbHazardousSports.valueChanges.subscribe(checked => {
      this.travelDetails.hazardousSports = Utility.setNull(checked, this.travelDetails.hazardousSports);
      Utility.updateValidator(hazardousSports, checked ? [Validators.required] : null);
    });

    quotationNumber.valueChanges.subscribe(number => {
      this.disableLoadBtn = Utility.isUndefined(number);
    });
  }

  travellers(): FormArray {
    return this.quoteForm.get("travellers") as FormArray
  }

  newTraveller(onLoad: boolean): FormGroup {
    const bdaymindate: Date = moment().subtract(65, 'years').toDate();

    return this.fb.group({
      completeName: ['', Validators.required],
      birthDate: ['', Validators.required],
      relationship: [onLoad ? 'P' : '', Validators.required],
      relationshipLabel: [onLoad ? 'PRIMARY' : ''],
      passportNumber: ['', Validators.required],
      physicianName: [null],
      bdaymindate: [bdaymindate],
    });
  }

  loadTraveller(completeName: string, birthDate: Date, relationship: string, passportNumber: string, physicianName: string): FormGroup {
    return this.fb.group({
      completeName: [completeName, Validators.required],
      birthDate: [birthDate, Validators.required],
      relationship: [relationship, Validators.required],
      passportNumber: [passportNumber, Validators.required],
      physicianName: [physicianName],
    });
  }

  addTraveller() {
    this.travellers().push(this.newTraveller(false));
    //if traveller is more than 1
    this.travelDetails.insuranceCoverage = "F"; //family

    //hides the add travel button if traveller head count is more than 5
    var travellers = this.quoteForm.get('travellers').value;
    this.travellerHeadCount = travellers.length;
  }

  removeTraveller(index: number) {
    this.travellers().removeAt(index);

    //shows the add travel button if traveller head count is less than 5
    var travellers = this.quoteForm.get('travellers').value;
    this.travellerHeadCount = travellers.length;
    if (travellers.length == 1) {
      //if traveller is primary only
      this.travelDetails.insuranceCoverage = "I"; //individual
    }
  }

  populateCoverage(coverageList: any[]) {
    this.coverageList = coverageList;
    this.showCoverage = true;
    this.triggerCoverage = this.triggerCoverage + 1;
    Utility.scroll('coverages');
  }

  populatePaymentBreakdown(breakdown: any[], receipt: {}) {
    this.paymentBreakdown = breakdown;
    this.paymentReceipt = receipt;
    this.showPaymentBreakdown = true;
  }

  proceed(type: number) {
    //if user changes affecting values
    const hasAffectingTraveller = this.checkAffectingTravellers();
    const hasChanges = this.changedValues.length != 0 || hasAffectingTraveller;

    const hasQuotationNumber = !Utility.isUndefined(this.travelDetails.quotationNumber);
    const isTemporaryQuotation = hasQuotationNumber && this.travelDetails.quotationNumber.startsWith('999');
    this.travelDetails.affecting = !hasQuotationNumber ||
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
          // this.savePolicy();
          break;
        }
        default: {
          // this.postPolicy();
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
    var formLabels = [
      {cbOneTripOnly : 'oneTripOnly'},
      {name : "client'sName"}
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

      let label : string = i.replace(/([A-Z])/g, ' $1').trim();
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
      number: isPostPolicy ? this.travelDetails.policyNumber : this.travelDetails.quotationNumber,
      product: this.codeName,
      payment: "ANNUAL",
      receipt: receipt,
      breakdown: breakdown,
      showExchangeRate: false,
      isPostPolicy: isPostPolicy
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
    this.newPage(page.QUO.TRA);
  }

  newPolicy() {
    this.newPage(page.ISS.TRA);
  }

  newPage(page : string) {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page);
      this.router.navigate(['/reload']);
    }, 500);
  }

  checkAffectingTravellers() {
    let hasTravellerChanges = false;

    if (!Utility.isUndefined(this.prevTravelDetails)) {
      this.changedTravellerValues = [];

      var travellers = this.quoteForm.get('travellers').value;
      const length = travellers.length;
      let prevlength = 0;
      if ('travellers' in this.prevTravelDetails) {
        const prevTravellers = this.prevTravelDetails.travellers;
        prevlength = prevTravellers.length;
        if (prevlength != length) {
          if (prevlength > length) {
            var diff = prevlength - length;
            var label = diff == 1 ? " traveller" : " travellers";
            this.changedTravellerValues.push(
              "Traveller: Deleted " + diff + label);
          } else {
            var diff = length - prevlength;
            var label = diff == 1 ? " traveller" : " travellers";
            this.changedTravellerValues.push(
              "Traveller: Added " + diff + label);
          }
        }

        prevTravellers.forEach((tra : Traveller) => {
          let matched = false;
          travellers.forEach((tra1: Traveller) => {
            if (tra.completeName == tra1.completeName) {
              matched = true;
              if (tra.relationship != tra1.relationship) {
                this.changedTravellerValues.push(
                  "Traveller relationship: Changed " + tra.relationshipLabel + " to " + tra1.relationshipLabel);
              }
              if (tra.passportNumber != tra1.passportNumber) {
                this.changedTravellerValues.push(
                  "Traveller Passport Number: Changed " + tra.passportNumber + " to " + tra1.passportNumber);
              }

              const prevDate = new Date(tra.birthDate);
              const prevBdate = prevDate.getMonth() + "/" + prevDate.getDate() + "/" + prevDate.getFullYear();

              const currDate = tra1.birthDate;
              const currBdate = currDate.getMonth() + "/" + currDate.getDate() + "/" + currDate.getFullYear();
              if (prevBdate != currBdate) {
                this.changedTravellerValues.push(
                  "Traveller Birthdate: Changed " + prevBdate + " to " + currBdate);
              }
            }
          });
          if (!matched) {
            this.changedTravellerValues.push(
              "Traveller: Changed Traveller List");
          }
        });
      }
      hasTravellerChanges = this.changedTravellerValues.length > 0;
    }

    return hasTravellerChanges;
  }

  affecting(key: string, label: string) {
    if (!Utility.isUndefined(this.travelDetails.quotationNumber) && this.prevTravelDetails != null) {
      let prev = this.prevTravelDetails[key] == undefined ? "" : this.prevTravelDetails[key];
      let curr = this.travelDetails[key] == undefined ? "" : this.travelDetails[key];
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
    this.tis.printQuote(this.travelDetails.quotationNumber);
  }

  printPolicy() {
    this.tis.printPolicy(this.travelDetails.policyNumber);
  }

  proceedToIssuance() {
    this.tis.proceedToIssuance(this.travelDetails.quotationNumber);
  }

  getProductCode() {
    this.codeName = null;

    let travelPack: string;
    this.LOV.packageLOV.forEach(tp => {
      if (tp.TRAVEL_PACK == this.travelDetails.travelPackage) {
        travelPack = tp.NOM_VALOR;
      }
    });

    let coverageOption: string;
    this.LOV.coverageOptionLOV.forEach(co => {
      if (co.COVERAGE_OPTIONS == this.travelDetails.coverageOption) {
        coverageOption = co.NOM_VALOR == 'ASSISTANCE ONLY' ? 'ASSIST ONLY' : co.NOM_VALOR;
      }
    });

    let medicalExpenses: string;
    this.LOV.medicalExpensesLOV.forEach(me => {
      if (me.VAL_CAMPO1 == this.travelDetails.medicalExpenses) {
        const name: string = me.VAL_CAMPO2;
        const value: string = me.VAL_CAMPO1;
        medicalExpenses = name.includes("EUROS") ? value.concat(" euros") : value;
      }
    });

    this.codeName = this.travelDetails.travelPackage == 'D' ?
      "DOMESTIC ".concat(medicalExpenses) :
      travelPack + " " + coverageOption + " " + medicalExpenses;

    this.LOV.productListLOV.forEach(product => {
      if (this.codeName == product.NOM_MODALIDAD) {
        this.travelDetails.product = product.COD_MODALIDAD;
      }
    });
  }

  //getting error or warning items
  getErrorItems(res: ReturnDTO, mcaTmpPptoMph: string, isIssuance: boolean) {
    this.withTechControl = false;
    const resErrorCode = res.obj["errorCode"];
    const resError = res.obj["error"];

    const isPostPolicy = Utility.isUndefined(resErrorCode);
    let items: any[] = isPostPolicy 
      ? ["Error occured while posting policy. Please contact administration."]
      : ["Error code is " + resErrorCode + " but does not return any error message. Please contact administration."];

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

  //generate and issue quote button
  issueQuote(mcaTmpPptoMph: string) {
    // S for generation and N for issue quotation
    this.travelDetails.mcaTmpPptoMph = mcaTmpPptoMph;

    // includes group policy to travel details DTO
    this.travelDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to travel details DTO
    this.travelDetails.policyHolder = this.policyHolder;

    // includes travellers to travel details DTO
    var travellers = this.quoteForm.get('travellers').value;
    this.travelDetails.travellers = travellers.length ? travellers : [];

    // get product code
    this.getProductCode();

    // to trigger changes when regenerating quotation
    this.showPaymentBreakdown = false;
    this.showCoverage = false;

    this.tis.issueQuote(this.travelDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        const items = this.getErrorItems(res, mcaTmpPptoMph, false);
        const status = res.obj["status"];
        if (status) {
          //duplicating car details for comparison
          const deepClone = JSON.parse(JSON.stringify(this.travelDetails));
          this.prevTravelDetails = deepClone;

          this.editMode = false;
          const errorCode = res.obj["errorCode"];
          if (errorCode == "S") {
            //if quotation has a warning
            this.modalRef = Utility.showHTMLWarning(this.bms, items);
          }

          const policyNumber = res.obj["policyNumber"];
          this.travelDetails.quotationNumber = policyNumber;

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

  assembleIssuePolicyData() {
    // always N for issue policy
    this.travelDetails.mcaTmpPptoMph = "N";

    // includes group policy to travel details DTO
    this.travelDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to travel details DTO
    this.travelDetails.policyHolder = this.policyHolder;

    // includes travellers to travel details DTO
    var travellers = this.quoteForm.get('travellers').value;
    this.travelDetails.travellers = travellers.length ? travellers : [];

    // get product code
    this.getProductCode();
  }

  //save policy button
  savePolicy() {
    this.assembleIssuePolicyData();

    // to trigger changes when regenerating quotation
    this.showCoverage = false;
    this.showPaymentBreakdown = false;

    this.tis.savePolicy(this.travelDetails).then(res => {
      if (res.status) {
        //clear affecting fields
        this.changedValues = [];

        var items = this.getErrorItems(res, this.travelDetails.mcaTmpPptoMph, true);
        const status = res.obj["status"];
        if (status) {
          //duplicating travel details for comparison
          const deepClone = JSON.parse(JSON.stringify(this.travelDetails));
          this.prevTravelDetails = deepClone;

          this.editMode = false;

          const errorCode = res.obj["errorCode"];
          const policyNumber = res.obj["policyNumber"];
          this.travelDetails.quotationNumber = policyNumber;

          const message = "You have successfully generated a new quotation: " + policyNumber;
          this.modalRef = Utility.showInfo(this.bms, message);

          const breakdown = res.obj["breakdown"];
          const receipt = res.obj["receipt"];
          this.populatePaymentBreakdown(breakdown, receipt);

          if (errorCode == "S") {
            //if quotation has a warning
            if (this.travelDetails.affecting) {
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

    if (this.withTechControl) {
      this.modalRef = Utility.showWarning(this.bms, "Quotation has technical control. Please request for approval first before posting the policy.");
    } else {
      this.tis.postPolicy(this.travelDetails).then(res => {
        if (res.status) {
          //clear affecting fields
          this.changedValues = [];

          var items = this.getErrorItems(res, this.travelDetails.mcaTmpPptoMph, true);
          const status = res.obj["status"];
          const policyNumber = res.obj["policyNumber"];
          if (status && !Utility.isUndefined(policyNumber)) {
            this.editMode = false;
            this.travelDetails.policyNumber = policyNumber;

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
}