import {
  Component,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  RequestDetails
} from 'src/app/objects/RequestDetails';
import {
  Utility
} from 'src/app/utils/utility';
import {
  RequestService
} from 'src/app/services/request.service';

@Component({
  selector: 'app-request-create',
  templateUrl: './request-create.component.html',
  styleUrls: ['./request-create.component.css']
})
export class RequestCreateComponent implements OnInit {
  requestDetails = new RequestDetails();
  requestForm: FormGroup;

  showPolicyDetails: boolean = false;
  showDetails: boolean = false;

  showEndorsementRT = false;
  showRenewalRT = false;
  showUnderwritingRT = false;

  //modal reference
  modalRef: BsModalRef;

  constructor(
    private fb: FormBuilder,
    private rs: RequestService,
    private bms: BsModalService) {
    this.createForm();
    this.setValidations();
  }

  ngOnInit(): void {}

  files: File[] = [];

  onSelect(event) {
    const addedFiles = event.addedFiles;
    const hasFiles = event.addedFiles.length
    if (hasFiles) {
      addedFiles.forEach(file => {
        if (file.size <= 9000000) {
          this.files.push(file);
        } else {
          const message = "Can not upload file " + file.name + ". Allowed file size is 9MB below only."
          this.modalRef = Utility.showError(this.bms, message);
        }
      });
    }
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  createForm() {
    this.requestForm = this.fb.group({
      type: ['', Validators.required],
      requestType: ['', Validators.required],
      issueType: ['', Validators.required],
      policyNumber: ['', Validators.required],
      reason: ['', Validators.required],
      agentEmail: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],

      type1: ['', Validators.required],
      type2: ['', Validators.required],
      branch: ['', Validators.required],
      line: ['', Validators.required],
      subline: ['', Validators.required],
      typeOfPolicy: ['', Validators.required],
      clientName: ['', Validators.required],
      clientGroup: ['', Validators.required],
      copyNotify: ['', Validators.required],
      comments: ['', Validators.required],
    });
  }

  // test(q: FormGroup) {
  //   let invalid = [];

  //   invalid = this.findInvalidControls(invalid, q);
  //   alert(invalid);
  // }

  // public findInvalidControls(invalid: any[], form: FormGroup) {
  //   const controls = form.controls;
  //   for (const name in controls) {
  //     if (controls[name].invalid) {
  //       invalid.push(name);
  //     }
  //     if (controls[name].pristine) {
  //       invalid.push(name);
  //     }
  //   }
  //   return invalid;
  // }

  setValidations() {
    this.requestForm.get('type').valueChanges.subscribe(type => {
      if (type !== undefined) {

        this.showPolicyDetails = type == 'P';
        this.showDetails = type !== 'P';

        this.showEndorsementRT = type == 'E';
        this.showRenewalRT = type == 'R';
        this.showUnderwritingRT = type == 'U';

        Utility.updateValidator(this.requestForm.get('type1'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('type2'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('branch'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('line'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('subline'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('typeOfPolicy'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('clientName'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('clientGroup'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('copyNotify'), this.showPolicyDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('comments'), this.showPolicyDetails ? [Validators.required] : null);

        Utility.updateValidator(this.requestForm.get('requestType'), this.showDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('policyNumber'), this.showDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('reason'), this.showDetails ? [Validators.required] : null);
        Utility.updateValidator(this.requestForm.get('agentEmail'), this.showDetails ? [Validators.required, Validators.email] : null);
        Utility.updateValidator(this.requestForm.get('name'), this.showDetails ? [Validators.required] : null);

        Utility.updateValidator(this.requestForm.get('issueType'), this.showUnderwritingRT ? [Validators.required] : null);

        // set default request type and issue type
        if (type == 'E') { //endorsement
          this.requestDetails.requestType = '1';
        } else if (type == 'R') { //renewal
          this.requestDetails.requestType = '5';
        } else if (type == 'U') { //underwriting
          this.requestDetails.requestType = 'S';
          this.requestDetails.issueType = 'P';
        }
      }

    });
  }

  request(requestDetails: RequestDetails) {
    if (requestDetails.type == 'P') { // policy request
      this.rs.policy(this.files, requestDetails).then((res) => {
        if (res.status) {
          this.modalRef = Utility.showInfo(this.bms, res.message);
        } else {
          this.modalRef = Utility.showError(this.bms, res.message);
        }
      });
    } else {
      this.rs.request(requestDetails, requestDetails.type).then((res) => {
        if (res.status) {
          this.modalRef = Utility.showInfo(this.bms, res.message);
        } else {
          this.modalRef = Utility.showError(this.bms, res.message);
        }
      });
    }
  }
}