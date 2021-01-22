import {
  Component,
  Inject,
  OnInit
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material';
import {
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  ListClientDetails
} from 'src/app/objects/ListClientDetails';

@Component({
  selector: 'app-view-details-modal',
  templateUrl: './view-details-modal.component.html',
  styleUrls: ['./view-details-modal.component.css']
})
export class ViewDetailsModalComponent implements OnInit {

  listClientDetails = new ListClientDetails();
  type: String;

  //modal reference
  modalRef: BsModalRef;

  constructor(public dialogRef: MatDialogRef < ViewDetailsModalComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.type = this.data.type;
    switch (this.type) {
      case "CLIENTDETAILS": {
        this.listClientDetails = this.data;
        break;
      }

      default: {
        // do nothing
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}
