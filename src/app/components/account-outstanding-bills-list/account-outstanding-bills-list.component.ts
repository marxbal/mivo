import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  MatSort
} from '@angular/material/sort';
import {
  MatPaginator
} from '@angular/material/paginator';
import {
  MatTableDataSource
} from '@angular/material/table';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  FormBuilder,
  FormGroup
} from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef
} from '@angular/material';
import {
  ListAccountOutstandingBills
} from 'src/app/objects/ListAccountOutstandingBills';
import {
  Utility
} from 'src/app/utils/utility';
import {
  AccountService
} from 'src/app/services/account.service';
import {
  ViewDetailsModalComponent
} from '../view-details-modal/view-details-modal.component';
import {
  page
} from '../../constants/page';
import {
  PageFilterAccount
} from 'src/app/objects/PageFilterAccount';
import {
  ActivatedRoute
} from '@angular/router';
import {
  filter, takeWhile
} from 'rxjs/operators';

@Component({
  selector: 'app-account-outstanding-bills-list',
  templateUrl: './account-outstanding-bills-list.component.html',
  styleUrls: ['./account-outstanding-bills-list.component.css']
})
export class AccountOutstandingBillsListComponent implements OnInit, OnDestroy {
  isAlive = true;
  displayedColumns: string[] = [
    'policyNumber',
    'policyHolder',
    'prn',
    'invoiceNumber',
    'currency',
    'effectivityDate',
    'expiryDate',
    'paymentDateExpiry',
    'age',
    'amount',
    'paymentStatus',
    'source',
    'subline'
  ];

  dataSource = new MatTableDataSource();

  paymentStatusItems: any[] = ['Processing'];
  currencyItems: any[] = ['PHP', 'EUR', 'USD'];
  sourceItems: any[] = ['MIVO', 'TRONWEB'];

  pageFilter: PageFilterAccount = new PageFilterAccount();

  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: String = 'policyNumber';
  sortOrder: String = 'asc';

  totalItem = 0;
  pageSizeOptions = [10, 20, 50, 100];

  paymentData;

  @ViewChild(MatSort, {
    static: true
  }) sort: MatSort;
  @ViewChild(MatPaginator, {
    static: true
  }) paginator: MatPaginator;
  @ViewChild('paymentResult') paymentResultModal: TemplateRef < any > ;

  //modal reference
  modalRef: BsModalRef;
  dialogRef: MatDialogRef < TemplateRef < any >> ;

  filterForm: FormGroup;

  constructor(public dialog: MatDialog,
    private as: AccountService,
    private bms: BsModalService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    var _this = this;
    //opening modal for success/failed payment
    this.route.queryParams
      .pipe(filter(params => params.successPage) )
      .subscribe(params => {
        this.paymentData = params;
        setTimeout(function(){
          params.message
          _this.openPaymentResultModal(params.vpc_Message === 'Approved', params.message);
        }, 500);
      });

    this.getList();
    this.createForm();
  }

  ngOnDestroy() {
    this.isAlive = false;
  }

  createForm() {
    this.filterForm = this.fb.group({
      policyNumber: [null],
      policyHolder: [null],
      prn: [null],
      invoiceNumber: [null],
      currency: [null],
      effectivityDate: [null],
      expiryDate: [null],
      paymentDateExpiry: [null],
      amount: [null],
      paymentStatus: [null],
      source: [null],
      subline: [null],
    });
  }

  setPageFilters() {
    this.pageFilter.currentPage = this.currentPage;
    this.pageFilter.pageSize = this.pageSize;
    this.pageFilter.sortBy = this.sortBy;
    this.pageFilter.sortOrder = this.sortOrder;

    this.pageFilter.effectivityDate = Utility.convertDatePickerDate(this.pageFilter.effectivityDate);
    this.pageFilter.expiryDate = Utility.convertDatePickerDate(this.pageFilter.expiryDate);
    this.pageFilter.paymentDateExpiry = Utility.convertDatePickerDate(this.pageFilter.paymentDateExpiry);
  }

  getList() {
    this.setPageFilters();
    this.as.shouldReloadOutstandingBills.pipe(
      takeWhile(() => this.isAlive)
    ).subscribe((shouldReload: boolean) =>  {
      if (shouldReload) {
        this.as.getOutstandingBillsList(this.pageFilter).then((res) => {
          this.as.shouldReloadOutstandingBills.next(false);
          if (res.status) {
            let data: ListAccountOutstandingBills[] = [];
            data = res.obj['list'];
            this.dataSource = new MatTableDataSource(data);
            this.totalItem = res.obj['totalItem'];
          } else {
            this.modalRef = Utility.showError(this.bms, res.message);
          }
        });
      }
    });
    this.as.getOutstandingBillsList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListAccountOutstandingBills[] = [];
        data = res.obj['list'];
        this.dataSource = new MatTableDataSource(data);
        this.totalItem = res.obj['totalItem'];
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

  pageChange(e: any) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.getList();
  }

  sortChange(e: any) {
    this.currentPage = 0;
    if (e.direction != '') {
      this.sortBy = e.active;
      this.sortOrder = e.direction;
    } else {
      // sort to default
      this.sortBy = 'policyNumber';
      this.sortOrder = 'asc';
    }
    this.getList();
  }

  getDetails(row: ListAccountOutstandingBills) {
    row.type = page.ACC.OUT;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListAccountOutstandingBills) {
    this.dialog.open(ViewDetailsModalComponent, {
      width: '1000px',
      data: details
    });
  }

  openPaymentResultModal(status: boolean, error: String): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.restoreFocus = false;
    dialogConfig.autoFocus = false;
    dialogConfig.role = 'dialog';
    dialogConfig.width = '600px';
    dialogConfig.data = {status : status, errorMessage: error};

    this.dialogRef = this.dialog.open(this.paymentResultModal, dialogConfig);
  }

  apply() {
    this.getList();
  }

  reset() {
    this.filterForm.get('policyNumber').setValue('');
    this.filterForm.get('policyHolder').setValue('');
    this.filterForm.get('prn').setValue('');
    this.filterForm.get('invoiceNumber').setValue('');
    this.filterForm.get('currency').setValue('');
    this.filterForm.get('effectivityDate').setValue('');
    this.filterForm.get('expiryDate').setValue('');
    this.filterForm.get('paymentDateExpiry').setValue('');
    this.filterForm.get('amount').setValue('');
    this.filterForm.get('paymentStatus').setValue('');
    this.filterForm.get('source').setValue('');
    this.filterForm.get('subline').setValue('');

    this.getList();
  }

}