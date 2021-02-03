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
  BsModalRef, BsModalService
} from 'ngx-bootstrap/modal';
import {
  ListAccountCommissionsPaid
} from 'src/app/objects/ListAccountCommissionsPaid';
import {
  ListAccountEstimatedCommissions
} from 'src/app/objects/ListAccountEstimatedCommissions';
import {
  ListAccountOutstandingBills
} from 'src/app/objects/ListAccountOutstandingBills';
import {
  ListAccountPremiumCollection
} from 'src/app/objects/ListAccountPremiumCollection';
import {
  ListClaimDetails
} from 'src/app/objects/ListClaimDetails';
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
import { UtilitiesQueryFilter } from '../../objects/UtilitiesQueryFilter';
import { UtilityQueryService } from '../../services/utility-query.service';
import { Utility  } from 'src/app/utils/utility';

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
  listClaimDetails = new ListClaimDetails();
  listAccountOutstandingBills = new ListAccountOutstandingBills();
  listAccountCommissionsPaid = new ListAccountCommissionsPaid();
  listAccountEstimatedCommissions = new ListAccountEstimatedCommissions();
  listAccountPremiumCollection = new ListAccountPremiumCollection();
  type: String;

  //modal reference
  modalRef: BsModalRef;

  filter: UtilitiesQueryFilter = new UtilitiesQueryFilter();

  constructor(
    public dialogRef: MatDialogRef < ViewDetailsModalComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utilityQueryService: UtilityQueryService,
    private bms: BsModalService, ) {}

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
      case page.CLI.CLA: {
        this.listClaimDetails = this.data;
        break;
      }
      case page.ACC.OUT: {
        this.listAccountOutstandingBills = this.data;
        break;
      }
      case page.ACC.COM: {
        this.listAccountCommissionsPaid = this.data;
        break;
      }
      case page.ACC.EST: {
        this.listAccountEstimatedCommissions = this.data;
        break;
      }
      case page.ACC.PRE: {
        this.listAccountPremiumCollection = this.data;
        break;
      }

      default: {
        // do nothing
      }
    }
  }

  pay(data : ListAccountOutstandingBills) {
    console.log(data);
  }

  close(): void {
    this.dialogRef.close();
  }

  inquire(): void {
    const userName = JSON.parse(localStorage.getItem('MIVO_login')).username

    if (userName != null) {
      this.filter.userName = userName
      this.filter.param = this.type === 'client-active' ? this.data.policyNumber : this.data.claimNumber;
      this.filter.inquiryType = this.type === 'client-active' ? 'GETPOLICYDETAILS' : 'GETCLAIMDETAILS';
      this.filter.paramName = this.type === 'client-active' ? 'policyNo' : 'claimNo';

      this.utilityQueryService.getSearchResult(this.filter).then((res) => {
          if (res) {
            const jsonData = JSON.parse(JSON.stringify(res));
            window.open(jsonData.obj, '_blank');
          }
        }
      );
    } else {
      this.modalRef = Utility.showError(this.bms, 'No login credentials found!');
    }
  }

}