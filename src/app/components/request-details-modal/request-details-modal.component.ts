import {
  Component,
  OnInit,
  Inject
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  RequestDetails
} from 'src/app/objects/RequestDetails';
import { RequestDetailsList } from 'src/app/objects/RequestDetailsList';
import { RequestService } from 'src/app/services/request.service';
import { Utility } from 'src/app/utils/utility';

@Component({
  selector: 'app-request-details-modal',
  templateUrl: './request-details-modal.component.html',
  styleUrls: ['./request-details-modal.component.css']
})
export class RequestDetailsModalComponent implements OnInit {
  requestForm: FormGroup;
  requestDetailsList: RequestDetailsList = new RequestDetailsList();
  requestDetails: RequestDetails = new RequestDetails();

  //modal reference
  modalRef: BsModalRef;

  constructor(public dialogRef: MatDialogRef < RequestDetailsModalComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private bms: BsModalService,
    private rs: RequestService,
  ) {}

  ngOnInit(): void {
    this.requestDetailsList = this.data;
    this.createForm();
  }

  createForm() {
    this.requestForm = this.fb.group({
      requestId: [null],
      requestHandler: [null],
      requestType: [null],
      policyNumber: [null],
      status: [null],
      message: [null],
      reply: ['', Validators.required],
      agentEmail: ['', [Validators.email, Validators.required]],
      name: ['', Validators.required],
    });
  }

  reply(): void {
    this.rs.reply(this.requestDetails).then((res) => {
      if (res.status) {
        this.modalRef = Utility.showInfo(this.bms, "Successfully replied to request.");
      } else {
        this.modalRef = Utility.showError(this.bms, "Unable to reply to request.");
      }
      this.dialogRef.close();
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}
