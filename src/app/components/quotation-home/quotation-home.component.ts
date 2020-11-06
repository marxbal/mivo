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
  Validators
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
  Validate
} from '../../validators/validate';
import {
  GroupPolicyLOV as lovUtil
} from '../../utils/lov/groupPolicy';
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
  Globals
} from 'src/app/utils/global';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';

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
  insuredHeadCount: number = 1;

  homeDetails = new Home();
  prevHomeDetails: Home = null;
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

  LOV = new HomeListObject();
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
    // private qq: QuickQuoteService,
    private hls: HomeLOVServices,
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
    this.GPLOV.groupPolicyLOV = lovUtil.getGroupPolicy();
    this.GPLOV.contractLOV = lovUtil.getContract();
    this.GPLOV.subContractLOV = lovUtil.getSubContract();
    this.GPLOV.commercialStructureLOV = lovUtil.getCommercialStructure();
  }

  createQuoteForm() {
    this.quoteForm = this.fb.group({
      subline: ['', Validators.required],
      currency: ['', Validators.required],
      buildingNumber: [null],
      subdivision: [null],
      buildingName: [null],
      streetName: [null],
      barangay: [null],
      region: ['', Validators.required],
      province: ['', Validators.required],
      municipality: ['', Validators.required],
      //building / content details
      buildingCapital: ['', Validators.required],
      contentValue: ['', Validators.required],
      constructionOfBuilding: ['', Validators.required],
      occupancyOfBuilding: ['', Validators.required],
      front: ['', Validators.required],
      right: ['', Validators.required],
      left: ['', Validators.required],
      rear: ['', Validators.required],
      // policy holder information
      clientName: [null],
      //group policy
      groupPolicy: ['', Validators.required],
      contract: [null],
      subContract: [null],
      commercialStructure: ['', Validators.required],
      agentCode: ['', Validators.required],
      cbIsRenewal: [null],
      expiringPolicyNumber: [null],
      //general information
      effectivityDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      //product data
      paymentMethod: ['', Validators.required],
      productList: ['', Validators.required],
    });
  }

  loadInit() {
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

    this.setDefaultValue();
  }

  setDefaultValue() {
    //setting default value
    this.homeDetails.sublineEffectivityDate = "15102014";
    this.homeDetails.currency = 1;
  }

  sublineOnChange() {
    var _this = this;
    this.homeDetails.subline = this.quoteForm.controls['subline'].value;

    this.hls.getCurrency(this.homeDetails).then(res => {
      _this.LOV.currencyLOV = res;
    });
    this.hls.getRelatedStructureProperty(this.homeDetails).then(res => {
      _this.LOV.relatedStructureLOV = res;
    });
    this.hls.getRelatedContentProperty(this.homeDetails).then(res => {
      _this.LOV.relatedContentLOV = res;
    });
    this.hls.getProduct(this.homeDetails).then(res => {
      _this.LOV.productListLOV = res;
    });
    this.hls.getPaymentPlan(this.homeDetails).then(res => {
      _this.LOV.paymentMethodLOV = res;
    });
  }

  setValidations() {
    Validate.setGroupPolicyValidations(this.quoteForm, this.groupPolicy);
    // Validate.setEffecivityDateValidations(this.quoteForm, this.homeDetails, this.expiryDateMinDate);
  }

  issueQuote(homeDetails: Home, groupPolicy: GroupPolicy) {
    console.log(homeDetails, groupPolicy);
  }
}
