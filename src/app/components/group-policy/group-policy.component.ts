import {
  Component,
  Input
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
  @Input() subline: String;
  @Input() groupPolicy: GroupPolicy;
  @Input() details: any;
  _details: any;

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

  ngOnChanges() {
    this._details = this.details;
    const _this = this;
    this.gpls.getGroupPolicy(this._details.subline).then(res => {
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
      agentCode: ['', Validators.required],
      cbIsRenewal: [null],
      expiringPolicyNumber: [null]
    });
  }

  groupPolicyOnChange() {
    const _this = this;
    _this.GPLOV.contractLOV = []
    this.gpls.getContract(this._details.subline, this.groupPolicy).then(res => {
      _this.GPLOV.contractLOV = res;
    });
  }

  contractOnChange() {
    const _this = this;
    _this.GPLOV.subContractLOV = []
    this.gpls.getSubContract(this._details.subline, this.groupPolicy).then(res => {
      _this.GPLOV.subContractLOV = res;
    });
  }
}
