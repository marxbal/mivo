import {
  Component,
  OnInit,
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
  Accident
} from '../../objects/Accident';
import {
  GroupPolicy
} from 'src/app/objects/GroupPolicy';
import {
  Utility
} from '../../utils/utility';
import {
  Validate
} from '../../validators/validate';
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

@Component({
  selector: 'app-quotation-accident',
  templateUrl: './quotation-accident.component.html',
  styleUrls: ['./quotation-accident.component.css']
})
export class QuotationAccidentComponent implements OnInit, AfterViewChecked {
  // currentUser = this.auths.currentUserValue;
  isIssuance: boolean = Globals.getAppType() == "I";
  isLoadQuotation: boolean = Globals.isLoadQuotation;
  pageLabel: String = 'Quotation';
  triggerCounter: number = 0;
  triggerCoverage: number = 0;

  accidentDetails = new Accident();
  groupPolicy = new GroupPolicy();
  policyHolder = new PolicyHolder();
  quoteForm: FormGroup;
  minDate: Date = moment().subtract(65, 'years').toDate();
  maxDate: Date = moment().subtract(18, 'years').toDate();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();

  //allow user to edit the form
  editMode = true;

  showOtherOccupation = false;
  showDetails: boolean = false;
  showSPADetails: boolean = false;
  showHCBIDetails: boolean = false;

  LOV = new AccidentListObject();
  GPLOV = new GroupPolicyListObject();

  constructor(
    private fb: FormBuilder,
    private als: AccidentLOVServices,
    private tpls: ThirdPartyLOVServices,
    private changeDetector: ChangeDetectorRef
  ) {
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
        //if loaded from accident quotation
        // this.travelDetails.quotationNumber = Globals.loadNumber;
        // this.loadQuotation();
        Globals.setLoadNumber('');
        Globals.setLoadQuotation(false);
      }
    }
  }

  createQuoteForm() {
    this.quoteForm = this.fb.group({
      subline: ['', Validators.required],
      //group policy
      groupPolicy: [null],
      contract: [null],
      subContract: [null],
      commercialStructure: ['', Validators.required],
      agentCode: ['', Validators.required],
      cbIsRenewal: [null],
      expiringPolicyNumber: [null],
      //general information
      effectivityDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      //policy holder information
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      //insured details
      middleName: [null],
      suffix: [null],
      gender: ['', Validators.required],
      relationship: ['', Validators.required],
      birthDate: ['', Validators.required],
      cbWithHealthDeclaration: [null],
      preExistingIllness: [null],
      occupationalClass: ['', Validators.required],
      occupation: ['', Validators.required],
      otherOccupation: [null],

      //disablement value
      disablementValue: [null],
      //product data
      product: ['', Validators.required],
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
        Utility.updateValidator(disablementValue, this.showSPADetails ? [Validators.required, Validators.max(2000000), Validators.min(10000)] : null);

        this.als.getOccupationalClass(this.accidentDetails).then(res => {
          _this.LOV.occupationalClassLOV = res;
        });
        this.als.getProduct(this.accidentDetails).then(res => {
          _this.LOV.productListLOV = res;
        });
        this.als.getPaymentPlan(this.accidentDetails).then(res => {
          // alert(res);
        });
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

    this.setDefaultValue();
  }

  setDefaultValue() {
    //setting default value
    this.accidentDetails.sublineEffectivityDate = "01012016";
    this.accidentDetails.relationship = 'PRIMARY';
  }

  occupationalClassOnchange() {
    var _this = this;
    this.showOtherOccupation = false;
    var otherOccupation = this.quoteForm.get('otherOccupation');
    Utility.updateValidator(otherOccupation, null);

    this.als.getOccupation(this.accidentDetails).then(res => {
      _this.LOV.occupationLOV = res;
    });
  }

  occupationOnchange() {
    const selectedOC = this.accidentDetails.occupationalClass + '199';
    this.showOtherOccupation = selectedOC == this.accidentDetails.occupation;

    var otherOccupation = this.quoteForm.get('otherOccupation');
    Utility.updateValidator(otherOccupation, this.showOtherOccupation ? [Validators.required] : null);
  }

  issueQuote(accidentDetails: Accident, groupPolicy: GroupPolicy) {
    console.log(accidentDetails, groupPolicy);
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
      // if (controls[name].pristine) {
      //   invalid.push(name);
      // }
    }
    return invalid;
  }

}
