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
  PageFilterClient
} from 'src/app/objects/PageFilterClient';
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
  Utility
} from 'src/app/utils/utility';
import {
  ClientService
} from 'src/app/services/client.service';
import {
  ViewDetailsModalComponent
} from '../view-details-modal/view-details-modal.component';
import {
  ListPolicyNotRenewed
} from 'src/app/objects/ListPolicyNotRenewed';
import {
  page
} from '../../constants/page';

@Component({
  selector: 'app-client-policy-not-renewed-list',
  templateUrl: './client-policy-not-renewed-list.component.html',
  styleUrls: ['./client-policy-not-renewed-list.component.css']
})
export class ClientPolicyNotRenewedListComponent implements OnInit {

  displayedColumns: string[] = [
    'policyNumber',
    'policyEffectivityDate',
    'policyDueDate',
    'line',
    'policyHolder',
    'source'
  ];

  dataSource = new MatTableDataSource();

  sourceItems: any[] = ['MIVO', 'TRONWEB'];

  pageFilter: PageFilterClient = new PageFilterClient();

  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: String = 'policyNumber';
  sortOrder: String = 'asc';

  totalItem = 0;
  pageSizeOptions = [10, 20, 50, 100];

  today: Date = new Date();

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
    private cs: ClientService,
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
      effectivityDate: [null],
      dueDate: [null],
      line: [null],
      policyHolder: [null],
      source: [null],
    });
  }

  setPageFilters() {
    this.pageFilter.currentPage = this.currentPage;
    this.pageFilter.pageSize = this.pageSize;
    this.pageFilter.sortBy = this.sortBy;
    this.pageFilter.sortOrder = this.sortOrder;

    this.pageFilter.effectivityDate = Utility.convertDatePickerDate(this.pageFilter.effectivityDate);
    this.pageFilter.dueDate = Utility.convertDatePickerDate(this.pageFilter.dueDate);
  }

  getList() {
    this.setPageFilters();
    this.cs.getPolicyNotRenewedList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListPolicyNotRenewed[] = [];
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

  getDetails(row: ListPolicyNotRenewed) {
    row.type = page.CLI.NOT;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListPolicyNotRenewed) {
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
    this.filterForm.get('effectivityDate').setValue('');
    this.filterForm.get('dueDate').setValue('');
    this.filterForm.get('line').setValue('');
    this.filterForm.get('policyHolder').setValue('');
    this.filterForm.get('source').setValue('');

    this.getList();
  }

}