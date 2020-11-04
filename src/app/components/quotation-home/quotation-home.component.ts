import {
  Component,
  OnInit,
  Input,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
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

@Component({
  selector: 'app-quotation-home',
  templateUrl: './quotation-home.component.html',
  styleUrls: ['./quotation-home.component.css']
})
export class QuotationHomeComponent implements OnInit, AfterViewChecked {
  homeDetails = new Home();
  groupPolicy = new GroupPolicy();

  quoteForm: FormGroup;
  mindate: Date = new Date();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();

  LOV = new HomeListObject();
  GPLOV = new GroupPolicyListObject();

  groupPolicyLOV: any[];
  contractLOV: any[];
  subContractLOV: any[];
  commercialStructureLOV: any[];

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
      businessLine: ['', Validators.required],
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
        if(subline.COD_RAMO === 200) {
          temp.push = subline;
        }
      });
      _this.LOV.sublineLOV = temp;
    });
    this.hls.getCurrency(this.homeDetails).then(res => {
      _this.LOV.currencyLOV = res;
    });
    this.hls.getRelatedStructureProperty(this.homeDetails).then(res => {
      _this.LOV.relatedStructureLOV = res;
    });
    this.hls.getRelatedContentProperty(this.homeDetails).then(res => {
      _this.LOV.relatedContentLOV = res;
    });

    this.setDefaultValue();
  }

  setDefaultValue() {
    //setting default value
    // this.homeDetails.sublineEffectivityDate = "01012016";
    // this.homeDetails.effectivityDate = this.today; // current today
  }

  setValidations() {
    Validate.setGroupPolicyValidations(this.quoteForm, this.groupPolicy);
    // Validate.setEffecivityDateValidations(this.quoteForm, this.homeDetails, this.expiryDateMinDate);
  }

  issueQuote(homeDetails: Home, groupPolicy: GroupPolicy) {
    console.log(homeDetails, groupPolicy);
  }
}
