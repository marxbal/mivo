import {
  Component,
  OnInit,
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
  PageFilterAccount
} from 'src/app/objects/PageFilterAccount';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  FormBuilder,
  FormGroup
} from '@angular/forms';
import {
  MatDialog
} from '@angular/material';
import {
  ListAccountCommissionsPaid
} from 'src/app/objects/ListAccountCommissionsPaid';
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

@Component({
  selector: 'app-account-commissions-paid-list',
  templateUrl: './account-commissions-paid-list.component.html',
  styleUrls: ['./account-commissions-paid-list.component.css']
})
export class AccountCommissionsPaidListComponent implements OnInit {

  displayedColumns: string[] = ['policyNumber', 'policyHolder', 'currency', 'invoiceNumber', 'receiptAmount', 'commissionAmount', 'withholdingTaxAmount', 'source'];
  dataSource = new MatTableDataSource();

  sourceItems: any[] = ['MIVO', 'TRONWEB'];

  pageFilter: PageFilterAccount = new PageFilterAccount();

  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: String = 'polilcyNumber';
  sortOrder: String = 'asc';

  totalItem = 0;
  pageSizeOptions = [10, 20, 50, 100];

  @ViewChild(MatSort, {
    static: true
  }) sort: MatSort;
  @ViewChild(MatPaginator, {
    static: true
  }) paginator: MatPaginator;

  //modal reference
  modalRef: BsModalRef;

  filterForm: FormGroup;

  constructor(public dialog: MatDialog,
    private as: AccountService,
    private bms: BsModalService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.getList();
    this.createForm();
  }

  createForm() {
    this.filterForm = this.fb.group({
      policyNumber: [null],
      policyHolder: [null],
      currency: [null],
      invoiceNumber: [null],
      receiptAmount: [null],
      commissionAmount: [null],
      withholdingTaxAmount: [null],
      source: [null]
    });
  }

  setPageFilters() {
    this.pageFilter.currentPage = this.currentPage;
    this.pageFilter.pageSize = this.pageSize;
    this.pageFilter.sortBy = this.sortBy;
    this.pageFilter.sortOrder = this.sortOrder;
  }

  getList() {
    this.setPageFilters();
    this.as.getCommissionsPaidList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListAccountCommissionsPaid[] = [];
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
      this.sortBy = 'polilcyNumber';
      this.sortOrder = 'asc';
    }
    this.getList();
  }

  getDetails(row: ListAccountCommissionsPaid) {
    row.type = page.ACC.COM;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListAccountCommissionsPaid) {
    this.dialog.open(ViewDetailsModalComponent, {
      width: '1000px',
      data: details
    });
  }

  apply() {
    this.getList();
  }

  reset() {
    this.filterForm.get('policyNumber').setValue('');
    this.filterForm.get('policyHolder').setValue('');
    this.filterForm.get('currency').setValue('');
    this.filterForm.get('invoiceNumber').setValue('');
    this.filterForm.get('receiptAmount').setValue('');
    this.filterForm.get('commissionAmount').setValue('');
    this.filterForm.get('withholdingTaxAmount').setValue('');
    this.filterForm.get('source').setValue('');

    this.getList();
  }

}
