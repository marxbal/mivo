import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import {
  Validate
} from '../../validators/validate';
import {
  GroupPolicyLOVServices
} from '../../services/lov/group-policy.service';
import {
  GroupPolicyListObject
} from 'src/app/objects/LOV/groupPolicyList';
import {
  GroupPolicy
} from 'src/app/objects/GroupPolicy';
import {
  AuthenticationService
} from '../../services/authentication.service';
import {
  Utility
} from 'src/app/utils/utility';

@Component({
  selector: 'app-group-policy',
  templateUrl: './group-policy.component.html',
  styleUrls: ['./group-policy.component.css']
})

export class GroupPolicyComponent {
  user = this.auths.currentUserValue;
  @Input() groupPolicy: GroupPolicy;
  @Input() prevDetails: any;
  @Input() changedValues: any[] = [];
  @Input()
  set subline(subline: number) {
    this._subline = subline;
    this.getGroupPolicyLOV();
  }
  @Input()
  set loadQuotation(value: number) {
    debugger
    this.triggerCounter = value;
    if (!Utility.isUndefined(this.groupPolicy.commercialStructure)) {
      alert('comss');
      this.gpForm.get('commercialStructure').markAsDirty();
    }
    if (!Utility.isUndefined(this.groupPolicy.groupPolicy)) {
      this.gpForm.get('groupPolicy').markAsDirty();
    }
    if (!Utility.isUndefined(this.groupPolicy.contract)) {
      this.gpForm.get('contract').markAsDirty();
    }
    if (!Utility.isUndefined(this.groupPolicy.subContract)) {
      this.gpForm.get('subContract').markAsDirty();
    }
  }

  @Output() changedValuesChange = new EventEmitter < any[] > ();
  triggerCounter: number;
  _subline: number;

  gpForm: FormGroup;
  GPLOV = new GroupPolicyListObject();

  today: Date = new Date();
  expiryDateMinDate: Date = moment().add(1, 'years').toDate();

  constructor(
    private gpls: GroupPolicyLOVServices,
    private fb: FormBuilder,
    private auths: AuthenticationService) {}

  ngOnInit(): void {
    this.createForm();
    setTimeout(() => {
      const hasSelectedAgent = this.user.selectedAgent != null;
      this.groupPolicy.agentCode = hasSelectedAgent ? this.user.agentCode : this.user.userId; //TODO

      this.groupPolicy.commercialStructure = this.user.selectedAgent != null ?
        this.user.selectedAgent.commStructure :
        this.user.commStructure;
      if (!Utility.isUndefined(this.groupPolicy.commercialStructure)) {
        this.gpForm.get('commercialStructure').markAsDirty();
      }

      const _this = this;
      this.gpls.getCommercialStructure().then(res => {
        _this.GPLOV.commercialStructureLOV = res;
      });

      Validate.setGroupPolicyValidations(this.gpForm, this.groupPolicy);
    });
  }

  getGroupPolicyLOV() {
    const _this = this;
    this.gpls.getGroupPolicy(this._subline).then(res => {
      _this.GPLOV.groupPolicyLOV = res;
    });
  }

  createForm() {
    this.gpForm = this.fb.group({
      //group policy
      groupPolicy: [null],
      contract: [null],
      subContract: [null],
      commercialStructure: ['', Validators.required],
      agentCode: [{
        value: '',
        disabled: true
      }, Validators.required],
      cbIsRenewal: [null],
      expiringPolicyNumber: [null]
    });
  }

  groupPolicyOnChange() {
    const _this = this;
    _this.GPLOV.contractLOV = []
    this.gpls.getContract(this._subline, this.groupPolicy).then(res => {
      _this.GPLOV.contractLOV = res;
    });
    if (this.groupPolicy.groupPolicy == undefined || this.groupPolicy.groupPolicy == 0) {
      this.changedValues = this.changedValues.filter(v => v !== 'Contract');
      this.changedValues = this.changedValues.filter(v => v !== 'Sub Contract');
      this.changedValuesChange.emit(this.changedValues);
    }
  }

  contractOnChange() {
    const _this = this;
    _this.GPLOV.subContractLOV = []
    this.gpls.getSubContract(this._subline, this.groupPolicy).then(res => {
      _this.GPLOV.subContractLOV = res;
    });
  }

  affecting(key: string, label: string) {
    if ('groupPolicy' in this.prevDetails) {
      const prev = this.prevDetails.groupPolicy[key] == undefined ? "" : this.prevDetails.groupPolicy[key];
      const curr = this.groupPolicy[key] == undefined ? "" : this.groupPolicy[key];
      if (prev != curr) {
        if (!this.changedValues.includes(label)) {
          //if changedValues length is greater than 0, request is affecting
          this.changedValues.push(label);
        }
      } else {
        //remove all occurence
        this.changedValues = this.changedValues.filter(v => v !== label); 
      }
      this.changedValuesChange.emit(this.changedValues);
    }
  }
}
