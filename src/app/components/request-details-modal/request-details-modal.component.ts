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
  MatTableDataSource,
  MAT_DIALOG_DATA
} from '@angular/material';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  ReplyDetails
} from 'src/app/objects/ReplyDetails';
import {
  RequestDetails
} from 'src/app/objects/RequestDetails';
import {
  RequestDetailsList
} from 'src/app/objects/RequestDetailsList';
import {
  RequestDetailsMessageList
} from 'src/app/objects/RequestDetailsMessageList';
import {
  RequestService
} from 'src/app/services/request.service';
import {
  Utility
} from 'src/app/utils/utility';

@Component({
  selector: 'app-request-details-modal',
  templateUrl: './request-details-modal.component.html',
  styleUrls: ['./request-details-modal.component.css']
})
export class RequestDetailsModalComponent implements OnInit {
  displayedColumns: string[] = ['requestHandler', 'message', 'user', 'source', 'postDate'];
  dataSource = new MatTableDataSource();

  requestForm: FormGroup;
  requestDetailsList: RequestDetailsList = new RequestDetailsList();
  requestDetails: RequestDetails = new RequestDetails();
  replyDetails = new ReplyDetails();

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
    this.getList();
  }

  createForm() {
    this.requestForm = this.fb.group({
      requestId: [null],
      requestHandler: [null],
      requestType: [null],
      policyNumber: [null],
      status: [null],
      message: [null],
      replyMessage: ['', Validators.required],
      agentEmail: ['', [Validators.email, Validators.required]],
      name: ['', Validators.required],
    });
  }

  getList() {
    this.rs.getMessageList(this.requestDetailsList.requestId).then((res) => {
      if (res.status) {
        let data: RequestDetailsMessageList[] = [];
        data = res.obj['list'];
        this.dataSource = new MatTableDataSource(data);
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

  reply(): void {
    this.replyDetails.requestId = this.requestDetailsList.requestId;
    this.replyDetails.requestType = this.requestDetailsList.requestType;

    this.rs.reply(this.replyDetails).then((res) => {
      if (res.status) {
        this.modalRef = Utility.showInfo(this.bms, res.message);
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
      this.dialogRef.close();
    });
  }

  close(): void {
    this.dialogRef.close();
  }

}