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
import {
  ListPolicyActive
} from 'src/app/objects/ListPolicyActive';
import {
  ListPolicyCancelled
} from 'src/app/objects/ListPolicyCancelled';
import {
  ListPolicyExpiring
} from 'src/app/objects/ListPolicyExpiring';
import {
  ListPolicyNotRenewed
} from 'src/app/objects/ListPolicyNotRenewed';
import {
  ListPolicyProvisional
} from 'src/app/objects/ListPolicyProvisional';
import {
  ListPolicyRenewed
} from 'src/app/objects/ListPolicyRenewed';
import {
  ListQuotationActive
} from 'src/app/objects/ListQuotationActive';
import {
  ListQuotationProvisional
} from 'src/app/objects/ListQuotationProvisional';
import {
  page
} from '../../constants/page';

@Component({
  selector: 'app-view-details-modal',
  templateUrl: './view-details-modal.component.html',
  styleUrls: ['./view-details-modal.component.css']
})
export class ViewDetailsModalComponent implements OnInit {

  listClientDetails = new ListClientDetails();
  listPolicyActive = new ListPolicyActive();
  listPolicyCancelled = new ListPolicyCancelled();
  listPolicyRenewed = new ListPolicyRenewed();
  listPolicyNotRenewed = new ListPolicyNotRenewed();
  listPolicyExpiring = new ListPolicyExpiring();
  listPolicyProvisional = new ListPolicyProvisional();
  listQuotationActive = new ListQuotationActive();
  listQuotationProvisional = new ListQuotationProvisional();
  type: String;

  //modal reference
  modalRef: BsModalRef;

  constructor(public dialogRef: MatDialogRef < ViewDetailsModalComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.type = this.data.type;
    switch (this.type) {
      case page.CLI.CLI: {
        this.listClientDetails = this.data;
        break;
      }
      case page.CLI.ACT: {
        this.listPolicyActive = this.data;
        break;
      }
      case page.CLI.CAN: {
        this.listPolicyCancelled = this.data;
        break;
      }
      case page.CLI.REN: {
        this.listPolicyRenewed = this.data;
        break;
      }
      case page.CLI.NOT: {
        this.listPolicyNotRenewed = this.data;
        break;
      }
      case page.CLI.EXP: {
        this.listPolicyExpiring = this.data;
        break;
      }
      case page.CLI.PRO: {
        this.listPolicyProvisional = this.data;
        break;
      }
      case page.CLI.ACTQ: {
        this.listQuotationActive = this.data;
        break;
      }
      case page.CLI.PROQ: {
        this.listQuotationProvisional = this.data;
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