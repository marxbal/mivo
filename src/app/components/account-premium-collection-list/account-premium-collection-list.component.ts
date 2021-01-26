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
  ListAccountPremiumCollection
} from 'src/app/objects/ListAccountPremiumCollection';
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
  selector: 'app-account-premium-collection-list',
  templateUrl: './account-premium-collection-list.component.html',
  styleUrls: ['./account-premium-collection-list.component.css']
})
export class AccountPremiumCollectionListComponent implements OnInit {

  displayedColumns: string[] = [
    'policyNumber',
    'currency',
    'subline',
    'invoiceNumber',
    'effectivityDate',
    'expiryDate',
    'collectedDate',
    'collectionType',
    'receiptAmount',
    'netPremium',
    'surcharge',
    'tax',
    'interest',
    'source'
  ];

  dataSource = new MatTableDataSource();

  sourceItems: any[] = ['MIVO', 'TRONWEB'];

  pageFilter: PageFilterAccount = new PageFilterAccount();

  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: String = 'policyNumber';
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
      currency: [null],
      subline: [null],
      invoiceNumber: [null],
      effectivityDate: [null],
      expiryDate: [null],
      collectedDate: [null],
      collectionType: [null],
      receiptAmount: [null],
      netPremium: [null],
      surcharge: [null],
      tax: [null],
      interest: [null],
      source: [null],
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
    this.as.getPremiumCollectionList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListAccountPremiumCollection[] = [];
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

  getDetails(row: ListAccountPremiumCollection) {
    row.type = page.ACC.PRE;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListAccountPremiumCollection) {
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
    this.filterForm.get('currency').setValue('');
    this.filterForm.get('subline').setValue('');
    this.filterForm.get('invoiceNumber').setValue('');
    this.filterForm.get('effectivityDate').setValue('');
    this.filterForm.get('expiryDate').setValue('');
    this.filterForm.get('collectedDate').setValue('');
    this.filterForm.get('collectionType').setValue('');
    this.filterForm.get('receiptAmount').setValue('');
    this.filterForm.get('netPremium').setValue('');
    this.filterForm.get('surcharge').setValue('');
    this.filterForm.get('tax').setValue('');
    this.filterForm.get('interest').setValue('');
    this.filterForm.get('source').setValue('');

    this.getList();
  }

}
