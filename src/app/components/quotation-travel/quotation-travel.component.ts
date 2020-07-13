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
  TravelQuoteServices
} from 'src/app/services/travel-quote.service';
import {
  validateItinerary
} from 'src/app/validators/validate';

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
  changedAccessoryValues: any[] = [];

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
  // coverageList: any[];
  // amountList: any[];
  // premiumAmount: any[];
  // coverageAmount: any[];
  // coverageVariable: any[];

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

  constructor(
    private fb: FormBuilder,
    private auths: AuthenticationService,
    private bms: BsModalService,
    private router: Router,
    private tls: TravelLOVServices,
    private tus: TravelUtilityServices,
    private tqs: TravelQuoteServices,
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

    this.travelDetails.subline = 380;
    this.travelDetails.startDate = null;
    this.travelDetails.endDate = null;
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

  proceed(type: number) {
    //if user changes affecting values
    // const hasAffectingTraveller = this.checkAffectingAccessories();
    const hasAffectingTraveller = false;
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
    // let product = "";
    // this.LOV.productListLOV.forEach((p) => {
    //   if (p.COD_MODALIDAD == this.carDetails.productList) {
    //     product = p.NOM_MODALIDAD;
    //   }
    // });

    // let payment = "";
    // this.LOV.paymentMethodLOV.forEach((p) => {
    //   if (p.COD_FRACC_PAGO == this.carDetails.paymentMethod) {
    //     payment = p.NOM_FRACC_PAGO;
    //   }
    // });

    // const modalData = {
    //   number: isPostPolicy ? this.carDetails.policyNumber : this.carDetails.quotationNumber,
    //   product: product,
    //   payment: payment,
    //   receipt: receipt,
    //   breakdown: breakdown,
    //   showExchangeRate: false,
    //   isPostPolicy: isPostPolicy
    // };

    // this.dialog.open(PaymentBreakdownModalComponent, {
    //   width: '1000px',
    //   data: modalData
    // });
  }

  manageBtn(opt: number, isModified ? : boolean) {
    // if (opt == 1) {
    //   //hides payment breakdown panel
    //   this.showPaymentBreakdown = false;

    //   // flag to edit coverage
    //   const modified = !Utility.isUndefined(isModified);

    //   this.editMode = !modified;
    //   this.showCoverage = modified;
    //   this.isModifiedCoverage = modified;
    //   if (modified) {
    //     Utility.scroll('coverages');
    //   }
    // }

    // if (this.isIssuance) {
    //   this.showIssuanceGenerateBtn = (opt == 1);
    //   this.showSaveBtn = (opt == 2);
    //   this.showPostBtn = (opt == 3);
    //   this.showPrintBtn = (opt == 4);
    // } else {
    //   this.showGenerateBtnGrp = (opt == 1);
    //   this.showIssueQuoteBtnGrp = (opt == 2);
    //   this.showProceedToIssuanceBtnGrp = (opt == 3);
    // }
  }

  newQuote() {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page.QUO.CAR);
      this.router.navigate(['/reload']);
    }, 500);
  }

  newPolicy() {
    Utility.scroll('topDiv');
    setTimeout(() => {
      Globals.setPage(page.ISS.CAR);
      this.router.navigate(['/reload']);
    }, 500);
  }

  affecting(key: string, label: string) {
    // if (!Utility.isUndefined(this.carDetails.quotationNumber) && this.prevCarDetails != null) {
    //   let prev = this.prevCarDetails[key] == undefined ? "" : this.prevCarDetails[key];
    //   let curr = this.carDetails[key] == undefined ? "" : this.carDetails[key];
    //   if (curr instanceof Date) {
    //     curr = curr.getMonth() + "/" + curr.getDate() + "/" + curr.getFullYear();
    //     if (!Utility.isUndefined(prev)) {
    //       var prevDate = new Date(prev);
    //       prev = prevDate.getMonth() + "/" + prevDate.getDate() + "/" + prevDate.getFullYear();
    //     }
    //   }

    //   if (prev != curr) {
    //     if (!this.changedValues.includes(label)) {
    //       //if changedValues length is greater than 0, request is affecting
    //       this.changedValues.push(label);
    //     }
    //   } else {
    //     //remove all occurence
    //     this.changedValues = this.changedValues.filter(v => v !== label);
    //   }
    // }
  }

  printQuote() {
    this.tqs.printQuote(this.travelDetails.quotationNumber);
  }

  printPolicy() {
    this.tqs.printPolicy(this.travelDetails.policyNumber);
  }

  proceedToIssuance() {
    this.tqs.proceedToIssuance(this.travelDetails.quotationNumber);
  }

  //generate and issue quote button
  issueQuote(mcaTmpPptoMph: string) {
    // S for generation and N for issue quotation
    this.travelDetails.mcaTmpPptoMph = mcaTmpPptoMph;

    // includes group policy to car details DTO
    this.travelDetails.groupPolicy = this.groupPolicy;
    // includes policy holder to car details DTO
    this.travelDetails.policyHolder = this.policyHolder;

    // includes accessories to car details DTO
    var travellers = this.quoteForm.get('travellers').value;
    this.travelDetails.travellers = travellers.length ? travellers : [];

    // to trigger changes when regenerating quotation
    this.showPaymentBreakdown = false;
    this.showCoverage = false;

    console.log(this.travelDetails);
    this.tqs.issueQuote(this.travelDetails).then(res1 => {
      // if (res1.status) {
      //   //clear affecting fields
      //   this.changedValues = [];

      //   const items = this.getErrorItems(res1, mcaTmpPptoMph, false);
      //   const status = res1.obj["status"];
      //   const coverageAmount = res1.obj["coverageAmount"];
      //   if (status && coverageAmount.length) {
      //     //duplicating car details for comparison
      //     const deepClone = JSON.parse(JSON.stringify(this.carDetails));
      //     this.prevCarDetails = deepClone;

      //     this.editMode = false;
      //     this.hasRoadAssist = res1.obj["hasRoadAssist"];
      //     const errorCode = res1.obj["errorCode"];
      //     if (errorCode == "S") {
      //       //if quotation has a warning
      //       this.modalRef = Utility.showHTMLWarning(this.bms, items);
      //     }

      //     const policyNumber = res1.obj["policyNumber"];
      //     this.carDetails.quotationNumber = policyNumber;

      //     const breakdown = res1.obj["breakdown"];
      //     const receipt = res1.obj["receipt"];

      //     if ("S" == mcaTmpPptoMph) {
      //       //for generation of quote
      //       const message = "You have successfully generated a quotation - " + policyNumber;
      //       this.modalRef = Utility.showInfo(this.bms, message);

      //       const coverageList = res.obj["coverageList"];
      //       const amountList = res.obj["amountList"];
      //       const premiumAmount = res1.obj["premiumAmount"];
      //       const coverageVariable = res1.obj["coverageVariable"];

      //       this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
      //       // if (this.isModifiedCoverage) {
      //       //   this.showCoverage = true;
      //       // } else {
      //       //   this.populateCoverage(coverageList, amountList, premiumAmount, coverageAmount, coverageVariable);
      //       // }

      //       this.isModifiedCoverage = false;
      //       this.populatePaymentBreakdown(breakdown, receipt);
      //       this.manageBtn(2);
      //     } else {
      //       // for issuing the quote
      //       this.openPaymentBreakdownModal(receipt, breakdown, false);
      //       this.manageBtn(3);
      //     }
      //   } else {
      //     this.modalRef = Utility.showHTMLError(this.bms, items);
      //   }
      // } else {
      //   this.modalRef = Utility.showError(this.bms, res1.message);
      // }
    });
  }
}