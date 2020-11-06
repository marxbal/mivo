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
  Validators, FormArray
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
  homeAddress = new PolicyHolder;
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
    private tpls: ThirdPartyLOVServices
  ) {
    this.createQuoteForm();
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

      improvement: [null],
      relatedStructure: this.fb.array([]),
      relatedContent: this.fb.array([]),

      //general information
      effectivityDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      //product data
      paymentMethod: ['', Validators.required],
      productList: ['', Validators.required],
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

  relatedStructure(): FormArray {
    return this.quoteForm.get("relatedStructure") as FormArray
  }

  relatedContent(): FormArray {
    return this.quoteForm.get("relatedContent") as FormArray
  }

  setDefaultValue() {
    //setting default value
    this.homeDetails.subline = 200; //residential
    this.homeDetails.sublineEffectivityDate = "15102014";
    this.homeDetails.effectivityDate = this.today; // current today
    this.homeDetails.currency = 1; //Philippine peso

    this.homeAddress.country = "PHL"; //Philippines
  }

  loadRelatedDetails(code: string, name: string): FormGroup {
    return this.fb.group({
      _value: [null],
      _code: [code],
      _name: [name]
    });
  }

  effectivityDateOnChange() {
    setTimeout(() => {
      this.homeDetails.expiryDate = moment(this.homeDetails.effectivityDate).add(1, 'years').toDate();
      this.expiryDateMinDate = this.homeDetails.expiryDate;
    }, 500);
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

  issueQuote(homeDetails: Home, groupPolicy: GroupPolicy) {
    // console.log(homeDetails, groupPolicy);
    console.log(this.quoteForm)
  }
}
