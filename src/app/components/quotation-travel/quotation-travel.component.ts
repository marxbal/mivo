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
  MatDialogRef
} from '@angular/material';
import {
  Globals
} from 'src/app/utils/global';
import {
  CoveragesComponent
} from '../coverages/coverages.component';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  TravelLOVServices
} from '../../services/lov/travel.service'

@Component({
  selector: 'app-quotation-travel',
  templateUrl: './quotation-travel.component.html',
  styleUrls: ['./quotation-travel.component.css']
})
export class QuotationTravelComponent implements OnInit, AfterViewChecked {
  @ViewChild(CoveragesComponent) appCoverage: CoveragesComponent;
  @ViewChild('proceedModal') proceedModal: TemplateRef < any > ;

  currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';
  triggerCounter: number = 0;
  triggerCoverage: number = 0;

  travelDetails = new Travel();
  prevTravelDetails: Travel = null;
  changedValues: any[] = [];
  changedAccessoryValues: any[] = [];

  withTechControl = false;

  groupPolicy = new GroupPolicy();
  policyHolder = new PolicyHolder();

  quoteForm: FormGroup;

  mindate: Date = new Date();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();
  endDateMinDate: Date = moment().add(1, 'days').toDate();
  enableEndDate: boolean = false;

  LOV = new TravelListObject();
  GPLOV = new GroupPolicyListObject();

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
    this.getCountry();
    this.getCurrency();

    this.getPackage();
    this.getType();
    this.getPurposeTrip();
    this.getOneTrip();

    this.getRelationship();

    // this.GPLOV.groupPolicyLOV = lovUtil.getGroupPolicy();
    // this.GPLOV.contractLOV = lovUtil.getContract();
    // this.GPLOV.subContractLOV = lovUtil.getSubContract();
    // this.GPLOV.commercialStructureLOV = lovUtil.getCommercialStructure();

    this.getTravelInsurance();
    this.getOptionPack();
    this.getMedicalExpenses();
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
      completeItinerary: ['', Validators.required],
      purposeOfTrip: ['', Validators.required],
      oneTripOnly: ['', Validators.required],
      cbWithCruise: [null],

      //travellers
      travellers: this.fb.array([this.newTraveller()]),
      //additional policy information
      cbSportsEquipment: [null],
      sportsEquipment: [null],
      cbHazardousSports: [null],
      hazardousSports: [null],
      //coverages
      travelInsurance: ['', Validators.required],
      optionPack: ['', Validators.required],
      medicalExpenses: ['', Validators.required],
    });
  }

  currencyOnchange() {
    var _this = this;

    //if currency is philippine peso
    this.travelDetails.country = this.travelDetails.currency === '1' ? [{
        NOM_PAIS: "PHILIPPINES",
        COD_PAIS: "PHL",
        NOM_VERNACULO: "PHILIPPINES",
        name: "PHILIPPINES",
        value: "PHL",
        type: "PHILIPPINES"
      }] :
      null;
    this.travelDetails.travelPackage = this.travelDetails.currency === '1' ?
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
  }

  setValidations() {
    var endDate = this.quoteForm.get('endDate');
    var startDate = this.quoteForm.get('startDate');
    var country = this.quoteForm.get('country');

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
        }
      }
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

  newTraveller(): FormGroup {
    return this.fb.group({
      completeName: ['', Validators.required],
      birthDate: ['', Validators.required],
      relationship: ['', Validators.required],
      passportNumber: ['', Validators.required],
      physicianName: [null],
    });
  }

  addTraveller() {
    this.travellers().push(this.newTraveller());
  }

  removeTraveller(index: number) {
    this.travellers().removeAt(index);
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  getCurrency() {
    this.LOV.currencyLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getCountry() {
    this.LOV.countryLOV = [{
        id: 1,
        name: 'Mumbai',
        type: 'asia'
      },
      {
        id: 2,
        name: 'Bangaluru',
        type: 'asia'
      },
      {
        id: 3,
        name: 'Pune',
        type: 'asia'
      },
      {
        id: 4,
        name: 'Navsari',
        type: 'asia'
      },
      {
        id: 5,
        name: 'New Delhi',
        type: 'asia'
      }
    ];
  }

  getPackage() {
    this.LOV.travelPackageLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getType() {
    this.LOV.travelTypeLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getPurposeTrip() {
    this.LOV.purposeOfTripLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getOneTrip() {
    this.LOV.oneTripOnlyLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getRelationship() {
    this.LOV.relationshipLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getTravelInsurance() {
    this.LOV.travelInsuranceLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getOptionPack() {
    this.LOV.optionPackLOV = [{
      value: "1",
      name: "test"
    }];
  }

  getMedicalExpenses() {
    this.LOV.medicalExpensesLOV = [{
      value: "1",
      name: "test"
    }];
  }

  issueQuote(travelDetails: Travel, groupPolicy: GroupPolicy) {
    var check = new Travel(this.quoteForm.value);
    console.log(check);
    console.log(travelDetails, groupPolicy);
  }

}
