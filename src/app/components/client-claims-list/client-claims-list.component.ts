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
  ListClaimDetails
} from 'src/app/objects/ListClaimDetails';
import {
  page
} from '../../constants/page';

@Component({
  selector: 'app-client-claims-list',
  templateUrl: './client-claims-list.component.html',
  styleUrls: ['./client-claims-list.component.css']
})
export class ClientClaimsListComponent implements OnInit {

  displayedColumns: string[] = [
    'claimNumber',
    'fileNumber',
    'fileName',
    'lossDate',
    'notificationDate',
    'reserveAmount',
    'source'
  ];

  dataSource = new MatTableDataSource();

  sourceItems: any[] = ['MIVO', 'TRONWEB'];

  pageFilter: PageFilterClient = new PageFilterClient();

  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: String = 'claimNumber';
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
      claimNumber: [null],
      fileNumber: [null],
      fileName: [null],
      lossDate: [null],
      notificationDate: [null],
      source: [null],
    });
  }

  setPageFilters() {
    this.pageFilter.currentPage = this.currentPage;
    this.pageFilter.pageSize = this.pageSize;
    this.pageFilter.sortBy = this.sortBy;
    this.pageFilter.sortOrder = this.sortOrder;

    this.pageFilter.lossDate = Utility.convertDatePickerDate(this.pageFilter.lossDate);
    this.pageFilter.notificationDate = Utility.convertDatePickerDate(this.pageFilter.notificationDate);
  }

  getList() {
    this.setPageFilters();
    this.cs.getClaimsList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListClaimDetails[] = [];
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
      this.sortBy = 'claimNumber';
      this.sortOrder = 'asc';
    }
    this.getList();
  }

  getDetails(row: ListClaimDetails) {
    row.type = page.CLI.CLA;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListClaimDetails) {
    this.dialog.open(ViewDetailsModalComponent, {
      width: '1000px',
      data: details
    });
  }

  apply() {
    this.getList();
  }

  reset() {
    this.filterForm.get('claimNumber').setValue('');
    this.filterForm.get('fileNumber').setValue('');
    this.filterForm.get('fileName').setValue('');
    this.filterForm.get('lossDate').setValue('');
    this.filterForm.get('notificationDate').setValue('');
    this.filterForm.get('source').setValue('');

    this.getList();
  }

}