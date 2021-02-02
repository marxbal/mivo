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
  ThirdPartyLOVServices
} from 'src/app/services/lov/third-party-lov-service';
import {
  ListPolicyRenewed
} from 'src/app/objects/ListPolicyRenewed';
import {
  page
} from '../../constants/page';

@Component({
  selector: 'app-client-policy-renewed-list',
  templateUrl: './client-policy-renewed-list.component.html',
  styleUrls: ['./client-policy-renewed-list.component.css']
})
export class ClientPolicyRenewedListComponent implements OnInit {
  displayedColumns: string[] = [
    'policyNumber',
    'policyEffectivityDate',
    'policyDueDate',
    'policyHolder',
    'documentType',
    'documentCode'
  ];

  dataSource = new MatTableDataSource();

  documentTypeItems: any[] = [];
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
    private tpls: ThirdPartyLOVServices
  ) {}

  ngOnInit() {
    this.getList();
    this.createForm();

    var _this = this;
    this.tpls.getDocumentType().then(res => {
      _this.documentTypeItems = res;
    });
  }

  createForm() {
    this.filterForm = this.fb.group({
      policyNumber: [null],
      effectivityDate: [null],
      dueDate: [null],
      policyHolder: [null],
      documentType: [null],
      documentCode: [null],
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
    this.cs.getPolicyRenewedList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListPolicyRenewed[] = [];
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

  getDetails(row: ListPolicyRenewed) {
    row.type = page.CLI.REN;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListPolicyRenewed) {
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
    this.filterForm.get('policyHolder').setValue('');
    this.filterForm.get('documentType').setValue('');
    this.filterForm.get('documentCode').setValue('');

    this.getList();
  }

}