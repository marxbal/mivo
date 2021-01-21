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
  RequestDetailsModalComponent
} from '../request-details-modal/request-details-modal.component';
import {
  MatDialog
} from '@angular/material';
import {
  RequestDetailsList
} from 'src/app/objects/RequestDetailsList';
import {
  RequestService
} from 'src/app/services/request.service';
import {
  PageFilter
} from 'src/app/objects/PageFilter';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  Utility
} from 'src/app/utils/utility';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css']
})
export class RequestListComponent implements OnInit {

  displayedColumns: string[] = ['requestType', 'requestId', 'policyNumber', 'status', 'requestHandler', 'user'];
  dataSource = new MatTableDataSource();

  pageFilter: PageFilter = new PageFilter();

  pageSize = 10;
  currentPage = 0;
  sortBy = 'requestType';
  sortOrder = 'asc';
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

  constructor(public dialog: MatDialog,
    private rs: RequestService,
    private bms: BsModalService) {}

  ngOnInit() {
    this.getList();
  }

  setPageFilters() {
    this.pageFilter.currentPage = this.currentPage;
    this.pageFilter.pageSize = this.pageSize;
    this.pageFilter.sortBy = this.sortBy;
    this.pageFilter.sortOrder = this.sortOrder;
  }

  getList() {
    this.setPageFilters();
    this.rs.getList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: RequestDetailsList[] = [];
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
      this.sortBy = 'requestType';
      this.sortOrder = 'asc';
    }
    this.getList();
  }

  getDetails(row: RequestDetailsList) {
    // let details = new RequestDetailsList();
    // details = row;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: RequestDetailsList) {
    this.dialog.open(RequestDetailsModalComponent, {
      width: '1000px',
      data: details
    });
  }
}
