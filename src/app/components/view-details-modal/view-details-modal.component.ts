import {
  Component,
  Inject,
  OnInit
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
  PaymentRequest
} from 'src/app/objects/PaymentRequest';
import {
  PaymentService
} from 'src/app/services/payment.service';
import {
  page
} from '../../constants/page';
import {
  UtilitiesQueryFilter
} from '../../objects/UtilitiesQueryFilter';
import {
  UtilityQueryService
} from '../../services/utility-query.service';
import {
  Utility
} from 'src/app/utils/utility';
import {
  CURRENT_USER,
  MIVO_REQUEST_DETAILS
} from "../../constants/local.storage";
import {
  UtilityService
} from 'src/app/services/utility.service';
import {
  RenewalPrinting
} from 'src/app/objects/RenewalPrinting';
import {
  RequestDetails
} from 'src/app/objects/RequestDetails';
import {
  Globals
} from '../../utils/global';
import {
  ReceiptPrinting
} from 'src/app/objects/ReceiptPrinting';

@Component({
  selector: 'app-view-details-modal',
  templateUrl: './view-details-modal.component.html',
  styleUrls: ['./view-details-modal.component.css']
})
export class ViewDetailsModalComponent implements OnInit {

  p = page;

  isProceedToPayment = false;
  title: string;
  paymentForm: FormGroup;
  paymentMethod: string = 'globalpay';

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

  subline: number;

  //modal reference
  modalRef: BsModalRef;
  filter: UtilitiesQueryFilter = new UtilitiesQueryFilter();

  constructor(
    public dialogRef: MatDialogRef < ViewDetailsModalComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utilityQueryService: UtilityQueryService,
    private bms: BsModalService,
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    private us: UtilityService,
  ) {}

  ngOnInit(): void {
    this.initPaymentForm();
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
        this.subline = parseInt(this.data.policyNumber.substr(0, 3));
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
      case page.ACC.SUC: {
        this.title = 'Payment Transaction Result';
        break;
      }

      default: {
        // do nothing
      }
    }
  }

  initPaymentForm() {
    this.paymentForm = this.formBuilder.group({
      address1: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      province: ['', Validators.required],
      zip: [''],
      email: ['', Validators.required],
      phone: [''],
      mobile: [''],
      paymentMethod: ['paynamics'],
    });
  }

  pay() {
    this.isProceedToPayment = true;
    this.title = 'Payment';
  }

  redirectToPayment(data: ListAccountOutstandingBills) {
    if (this.paymentMethod === 'paynamics') {
      const splitName = data.policyHolder.split(',');
      const splitNameFirstMiddle = splitName[1].split(' ');
      const middleName = splitNameFirstMiddle.length > 1 ? splitNameFirstMiddle[splitNameFirstMiddle.length - 1] : '';
      const paymentRequest: PaymentRequest = {
        firstName: splitName[1].replace(middleName, ''),
        middleName,
        lastName: splitName[0],
        address1: this.paymentForm.value.address1,
        address2: this.paymentForm.value.address2,
        city: this.paymentForm.value.city,
        province: this.paymentForm.value.province,
        zip: this.paymentForm.value.zip,
        policyNumber: data.policyNumber,
        invoiceNumber: data.invoiceNumber,
        amount: Math.trunc(Number(data.amount)).toString() + '.00',
        email: this.paymentForm.value.email,
        phone: this.paymentForm.value.phone,
        mobile: this.paymentForm.value.mobile,
      };

      this.paymentService.getPaymentUrl(paymentRequest).then((response) => {
        var mapForm = document.createElement("form");
        mapForm.method = "POST"; // or "post" if appropriate
        mapForm.action = response.url;
        var mapInput = document.createElement("input");
        mapInput.type = "hidden";
        mapInput.name = "paymentRequest";
        mapInput.setAttribute("value", response.value);
        mapForm.appendChild(mapInput);
        document.body.appendChild(mapForm);
        mapForm.submit();
      });
    } else {
      this.paymentService.getPaymentUrlViaGlobalPay(data.invoiceNumber).then((response) => {
        var mapForm = document.createElement("form");
        mapForm.method = "POST"; // or "post" if appropriate
        mapForm.action = response.url;

        Object.entries(response).forEach((attribute: any[]) => {
          if (attribute[0] === 'url') {
            return;
          }

          var mapInput = document.createElement("input");
          mapInput.type = "hidden";
          mapInput.name = attribute[0].replaceAll('vpc', 'vpc_');
          mapInput.setAttribute("value", attribute[1]);
          mapForm.appendChild(mapInput);
        });

        document.body.appendChild(mapForm);
        mapForm.submit();
      });
    }

  }

  inquire(): void {
    const userName = JSON.parse(localStorage.getItem(CURRENT_USER)).username

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
      });
    } else {
      this.modalRef = Utility.showError(this.bms, 'No login credentials found!');
    }
  }

  downloadRenewalPolicy(): void {
    const eDate = this.listPolicyExpiring.policyExpiryDate.split("/");
    const renewal = new RenewalPrinting();

    renewal.month = parseInt(eDate[0]);
    renewal.year = parseInt(eDate[2]);
    renewal.policyNumber = this.listPolicyExpiring.policyNumber;

    this.us.downloadRenewalPolicy(renewal).subscribe(data => {
      if (data != null) {
        window.open(URL.createObjectURL(data));
      }
    });
  }

  requestRenewal(): void {
    const requestDetails = new RequestDetails();
    requestDetails.policyNumber = this.listPolicyExpiring.policyNumber;
    requestDetails.type = "R";
    requestDetails.requestType = "5";

    localStorage.setItem(MIVO_REQUEST_DETAILS, JSON.stringify(requestDetails));
    this.dialogRef.close();
    Globals.setPage(page.REQ.CRE);
  }

  downloadReceipt(data: ListAccountOutstandingBills): void {
    const receipt = new ReceiptPrinting();

    receipt.prn = data.prn;
    receipt.invoiceNumber = data.invoiceNumber;
    receipt.subline = this.subline;

    this.us.downloadReceipt(receipt).subscribe(data => {
      if (data != null) {
        window.open(URL.createObjectURL(data));
      } else {
        this.modalRef = Utility.showWarning(this.bms, 'Unable to print receipt at the moment.');
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  changePaymentMethod(event) {
    if (this.paymentMethod === event.target.value) {
      return;
    }
    this.paymentMethod = event.target.value;
  }
}