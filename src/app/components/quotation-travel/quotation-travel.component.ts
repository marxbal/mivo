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
// import {
//   AuthenticationService
// } from 'src/app/services/authentication.service';
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
  Traveler
} from 'src/app/objects/Traveler';

@Component({
  selector: 'app-quotation-travel',
  templateUrl: './quotation-travel.component.html',
  styleUrls: ['./quotation-travel.component.css']
})
export class QuotationTravelComponent implements OnInit, AfterViewChecked {
  @ViewChild(CoveragesComponent) appCoverage: CoveragesComponent;
  @ViewChild('proceedModal') proceedModal: TemplateRef < any > ;
  @ViewChild('validationModal') validationModal: TemplateRef < any > ;

  // currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';
  triggerCounter: number = 0;
  triggerCoverage: number = 0;
  triggerBreakdown: number = 0;
  travelerHeadCount: number = 1;

  travelDetails = new Travel();
  prevTravelDetails: Travel = null;
  changedValues: any[] = [];
  changedTravelerValues: any[] = [];

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
  //flag to show new quote and new policy btn
  showNewPolicyBtn: boolean = false;

  //disable load button
  disableLoadBtn: boolean = true;

  //modal reference
  modalRef: BsModalRef;
  dialogRef: MatDialogRef < TemplateRef < any >> ;

  codeName: String;

  constructor(
    private fb: FormBuilder,
    // private auths: AuthenticationService,
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
        //if loaded from travel quotation
        this.travelDetails.quotationNumber = Globals.loadNumber;
        this.loadQuotation();
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
      countries: ['', Validators.required],
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
      //travelers
      travelers: this.fb.array([this.newTraveler(true)]),
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
    this.travelDetails.countries = this.travelDetails.currency === 1 ? [{
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
    
    this.travelDetails.coverageOption = this.travelDetails.currency === 1 ?
      "CO" :
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

    this.removeTravelers();
    this.newTraveler(true);
  }

  relationshipOnChange(traveler: FormGroup) {
    var val = traveler.controls['relationship'].value;
    var maxAge = (val == 'C') ? 21 : 65;
    var minAge = (val == 'C') ? 0 : 18;

    const bdaymindate: Date = moment().subtract(maxAge, 'years').toDate();
    traveler.controls['bdaymindate'].setValue(bdaymindate);

    const bdaymaxdate: Date = moment().subtract(minAge, 'years').toDate();
    traveler.controls['bdaymaxdate'].setValue(bdaymaxdate);

    traveler.controls['birthDate'].setValue('');

    this.LOV.relationshipLOV.forEach(r => {
      if (r.COD_VALOR == val) {
        traveler.controls['relationshipLabel'].setValue(r.NOM_VALOR);
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
    this.tis.loadQuotation(this.travelDetails.quotationNumber).then(res => {
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
            //general information details
            case "TRAVEL_PACK": {
              this.travelDetails.travelPackage = value;
              break;
            }
            case "TRAVEL_TYPE": {
              this.travelDetails.travelType = value;
              break;
            }
            // case "ARRIVAL_DATE": {
            // case "DEPARTURE_DATE": {

            case "VAL_NUM_DAYS_TRIP": {
              this.travelDetails.noOfDays = valueInt;
              break;
            }
            case "ITINERARY": {
              this.travelDetails.completeItinerary = value;
              break;
            }
            case "PURPOSE_TRIP": {
              this.travelDetails.purposeOfTrip = value;
              break;
            }
            case "TXT_OTHERS_DESCRIPTION": {
              this.travelDetails.othersDescription = value;
              break;
            } 
            case "MCA_ONE_TRIP_ONLY": {
              this.travelDetails.cbOneTripOnly = value == "Y";
              break;
            }
            case "MCA_WITH_CRUISE": {
              this.travelDetails.cbWithCruise = value == "S";
              break;
            }

            //additional policy information
            case "TXT_SPORTS_EQUIPMENT": {
              this.travelDetails.cbSportsEquipment = true;
              this.travelDetails.sportsEquipment = value;
              break;
            }
            case "TXT_HAZARDOUS_SPORTS": {
              this.travelDetails.cbHazardousSports = true;
              this.travelDetails.hazardousSports = value;
              break;
            }

            //coverages
            case "INSURANCE_COVERAGE": {
              this.travelDetails.insuranceCoverage = value;
              break;
            }
            case "COVERAGE_OPTIONS": {
              this.travelDetails.coverageOption = value;
              break;
            }
            case "EXPENSES_COVERAGE": {
              this.travelDetails.medicalExpenses = value;
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });
  
        const country : any[] = [];
        var tempTravaler = [];

        const travelerDetails = res.obj["travelerDetails"] as any[];
        travelerDetails.forEach(t => {
          const code = t.codCampo;
          const value: string = t.valCampo;
          const text: string = t.txtCampo;
          const occurence: number = t.numOcurrencia;
          // const index = occurence - 1;
          // let valueInt: number = undefined;
  
          // try {
          //   valueInt = parseInt(value);
          // } catch (e) {
          //   // do nothing
          // }
  
          switch (code) {
            //country
            case "TXT_COUNTRY_NAME": {
              const obj = { NOM_PAIS: text, COD_PAIS: value, name: text, value: value };
              country.push(obj);
              break;
            }
            case "COMPLETE_NAME": {
              const obj = { completeName: value, occurence: occurence };
              tempTravaler.push(obj);
              break;
            }
  
            default: {
              // do nothing
            }
          }
        });

        this.travelDetails.countries = country;

        var travelers = [];
        tempTravaler.forEach(t => {
          const tObj = new Traveler();
          tObj.completeName = t.completeName;
          travelerDetails.forEach(td => {
            const code = td.codCampo;
            const value: string = td.valCampo;
            const text: string = td.txtCampo;
            const occurence: number = td.numOcurrencia;
            // let valueInt: number = undefined;
    
            // try {
            //   valueInt = parseInt(value);
            // } catch (e) {
            //   // do nothing
            // }

            if (t.occurence == occurence) {
              switch (code) {
                case "RELATIONSHIP": {
                  tObj.relationship = value;
                  tObj.relationshipLabel = text;
                  break;
                }
                case "BIRTHDATE": {
                  const date = Utility.convertStringDate(value);
                  tObj.birthDate = date;
                  break;
                }
                case "PASSPORT_NUMBER": {
                  tObj.passportNumber = value;
                  break;
                }
                case "USUAL_PHYSICIAN": {
                  tObj.physicianName = value;
                  break;
                }
                default: {
                  // do nothing
                }
              }
            }
          });
          travelers.push(tObj);
        });

        if (travelers.length) {
          //removes all accessories
          this.removeTravelers();
          var temp: any[] = [];
          travelers.forEach((tra: any) => {
            temp.push({
              traveler: tra.completeName
            });
            this.travelers().push(this.loadTraveler(tra.completeName, tra.birthDate, tra.relationship, tra.relationshipLabel, tra.passportNumber, tra.physicianName));
          });
  
          var travelersForm = this.quoteForm.get('travelers').value;
          this.travelDetails.travelers = travelersForm;
        } else {
          this.travelDetails.travelers = [];
        }
  
        const generalInfo = res.obj["generalInfo"];
        this.travelDetails.subline = generalInfo.codRamo;
        this.travelDetails.currency = generalInfo.codMon;
        this.travelDetails.startDate = new Date(generalInfo.fecEfecPoliza.substr(0,10));
        this.travelDetails.endDate = new Date(generalInfo.fecVctoPoliza.substr(0,10));
  
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
        this.travelDetails.groupPolicy = this.groupPolicy;
  
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
        const deepClone = JSON.parse(JSON.stringify(this.travelDetails));
        this.prevTravelDetails = deepClone;

        //prevent to post policy if quotation has technical control
        const technicalControl = res.obj["technicalControl"];
        if (generalInfo.mcaProvisional == "S" && technicalControl.length > 0) {
          this.withTechControl = true;
          this.editMode = false;
          this.modalRef = Utility.showError(this.bms, "Quotation has technical control. Please request for approval first before posting the policy.");
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
        this.travelDetails.quotationNumber = "";
      }
    }).finally(() => {
      //trigger child component load quotation function
      this.triggerCounter = this.triggerCounter + 1;
    });
  }

  //loading of all LOV's for load quotation
  loadLOVs() {
    var _this = this;
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

    this.tls.getExpensesCoverage(this.travelDetails).then((res) => {
      _this.LOV.medicalExpensesLOV = res;
    });
  }

  setValidations() {
    var endDate = this.quoteForm.get('endDate');
    var startDate = this.quoteForm.get('startDate');
    var countries = this.quoteForm.get('countries');
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

    countries.valueChanges.subscribe(countryList => {
      var packageList = [];
      if (!Utility.isUndefined(countryList)) {
        countryList.forEach(country => {
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
        } else if (packageList.indexOf("PHILIPPINES") !== -1) {
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

  travelers(): FormArray {
    return this.quoteForm.get("travelers") as FormArray
  }

  newTraveler(onLoad: boolean): FormGroup {
    const bdaymindate: Date = moment().subtract(65, 'years').toDate();
    var ageLimit = onLoad ? 18 : 0;
    const bdaymaxdate: Date = moment().subtract(ageLimit, 'years').toDate();

    return this.fb.group({
      completeName: ['', Validators.required],
      birthDate: ['', Validators.required],
      relationship: [onLoad ? 'P' : '', Validators.required],
      relationshipLabel: [onLoad ? 'PRIMARY' : ''],
      passportNumber: ['', this.travelDetails.currency === 1 ? null : Validators.required],
      physicianName: [null],
      bdaymindate: [bdaymindate],
      bdaymaxdate: [bdaymaxdate],
    });
  }

  loadTraveler(completeName: string, birthDate: Date, relationship: string, relationshipLabel: string, passportNumber: string, physicianName: string): FormGroup {
    const bdaymindate: Date = moment().subtract(relationship == 'C' ? 21 : 65, 'years').toDate();
    const bdaymaxdate: Date = moment().subtract(relationship == 'C' ? 0 : 18, 'years').toDate();

    return this.fb.group({
      completeName: [completeName, Validators.required],
      birthDate: [birthDate, Validators.required],
      relationship: [relationship, Validators.required],
      relationshipLabel: [relationshipLabel],
      passportNumber: [passportNumber, this.travelDetails.currency === 1 ? null : Validators.required],
      physicianName: [physicianName],
      bdaymindate: [bdaymindate],
      bdaymaxdate: [bdaymaxdate],
    });
  }

  addTraveler() {
    this.travelers().push(this.newTraveler(false));
    //if traveler is more than 1
    this.travelDetails.insuranceCoverage = "F"; //family

    //hides the add travel button if traveler head count is more than 5
    var travelers = this.quoteForm.get('travelers').value;
    this.travelerHeadCount = travelers.length;
  }

  removeTraveler(index: number) {
    this.travelers().removeAt(index);

    //shows the add travel button if traveler head count is less than 5
    var travelers = this.quoteForm.get('travelers').value;
    this.travelerHeadCount = travelers.length;
    if (travelers.length == 1) {
      //if traveler is primary only
      this.travelDetails.insuranceCoverage = "I"; //individual
    }
  }

  removeTravelers() {
    // removing all travelers
    var travelers = this.quoteForm.get('travelers').value;
    if (travelers.length > 0) {
      // loop until all accessories removed
      this.travelers().removeAt(0);
      this.removeTravelers();
    }
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
    const hasAffectingTraveler = this.checkAffectingTravelers();
    const hasChanges = this.changedValues.length != 0 || hasAffectingTraveler;

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
      this.showNewPolicyBtn = (opt == 5);
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

  checkAffectingTravelers() {
    let hasTravelerChanges = false;

    if (!Utility.isUndefined(this.prevTravelDetails)) {
      this.changedTravelerValues = [];

      var travelers = this.quoteForm.get('travelers').value;
      const length = travelers.length;
      let prevlength = 0;
      if ('travelers' in this.prevTravelDetails) {
        const prevTravelers = this.prevTravelDetails.travelers;
        prevlength = prevTravelers.length;
        if (prevlength != length) {
          if (prevlength > length) {
            var diff = prevlength - length;
            var label = diff == 1 ? " traveler" : " travelers";
            this.changedTravelerValues.push(
              "Traveler: Deleted " + diff + label);
          } else {
            var diff = length - prevlength;
            var label = diff == 1 ? " traveler" : " travelers";
            this.changedTravelerValues.push(
              "Traveler: Added " + diff + label);
          }
        }

        prevTravelers.forEach((tra : Traveler) => {
          let matched = false;
          travelers.forEach((tra1: Traveler) => {
            if (tra.completeName == tra1.completeName) {
              matched = true;
              if (tra.relationship != tra1.relationship) {
                this.changedTravelerValues.push(
                  "Traveler relationship: Changed " + tra.relationshipLabel + " to " + tra1.relationshipLabel);
              }
              if (tra.passportNumber != tra1.passportNumber) {
                this.changedTravelerValues.push(
                  "Traveler Passport Number: Changed " + tra.passportNumber + " to " + tra1.passportNumber);
              }

              const prevDate = new Date(tra.birthDate);
              const prevBdate = prevDate.getMonth() + "/" + prevDate.getDate() + "/" + prevDate.getFullYear();

              const currDate = tra1.birthDate;
              const currBdate = currDate.getMonth() + "/" + currDate.getDate() + "/" + currDate.getFullYear();
              if (prevBdate != currBdate) {
                this.changedTravelerValues.push(
                  "Traveler Birthdate: Changed " + prevBdate + " to " + currBdate);
              }
            }
          });
          if (!matched) {
            this.changedTravelerValues.push(
              "Traveler: Changed Traveler List");
          }
        });
      }
      hasTravelerChanges = this.changedTravelerValues.length > 0;
    }

    return hasTravelerChanges;
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

  assembleData(mcaTmpPptoMph: string) {
    // S for generation and N for issue quotation
    this.travelDetails.mcaTmpPptoMph = mcaTmpPptoMph;

    // includes group policy to travel details DTO
    this.travelDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to travel details DTO
    this.travelDetails.policyHolder = this.policyHolder;

    // includes travelers to travel details DTO
    var travelers = this.quoteForm.get('travelers').value;
    this.travelDetails.travelers = travelers.length ? travelers : [];

    // get product code
    this.getProductCode();

    // to trigger changes when regenerating quotation
    this.showPaymentBreakdown = false;
    this.showCoverage = false;
  }

  //generate and issue quote button
  issueQuote(mcaTmpPptoMph: string) {
    this.assembleData(mcaTmpPptoMph);

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

  //save policy button
  savePolicy() {
    this.assembleData("N");

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

          this.withTechControl = errorCode == 'S';
          if (this.withTechControl) {
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
    this.assembleData("N");

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
            this.manageBtn(5);
            this.modalRef = Utility.showHTMLError(this.bms, items);
          }
        } else {
          this.manageBtn(5);
          this.modalRef = Utility.showError(this.bms, res.message);
        }
      });
    }
  }
}