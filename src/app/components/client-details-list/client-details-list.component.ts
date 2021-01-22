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
  PageFilter
} from 'src/app/objects/PageFilter';
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
  ListClientDetails
} from 'src/app/objects/ListClientDetails';
import {
  Utility
} from 'src/app/utils/utility';
import {
  ClientService
} from 'src/app/services/client.service';

export interface OutstandingBillsDTO {
  name: string;
  documentType: string;
  documentCode: string;
  address: string;
  homeTelNumber: string;
  businessTelNumber: string;
  mobileNumber: string;
  email: string;
}

const ELEMENT_DATA: OutstandingBillsDTO[] = [{
  name: "LEBRON JAMES",
  documentType: "PAS",
  documentCode: "PASS23",
  address: "LOS ANGELES",
  homeTelNumber: "230948324",
  businessTelNumber: "230948324",
  mobileNumber: "230948324",
  email: "lebron@james.com"
}];

@Component({
  selector: 'app-client-details-list',
  templateUrl: './client-details-list.component.html',
  styleUrls: ['./client-details-list.component.css']
})
export class ClientDetailsListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'documentType', 'documentCode', 'address', 'homeTelNumber', 'businessTelNumber', 'mobileNumber', 'email'];
  dataSource = new MatTableDataSource();

  requestTypeItems = ["APPROVAL", "CANCELLATION", "RENEWAL", "GENERAL"];

  pageFilter: PageFilter = new PageFilter();

  currentPage: number = 0;
  pageSize: number = 10;
  sortBy: String = 'name';
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
    private cs: ClientService,
    private bms: BsModalService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getList();
    this.createForm();
  }

  createForm() {
    this.filterForm = this.fb.group({
      name: [null],
      documentType: [null],
      documentCode: [null],
      address: [null],
      homeTelNumber: [null],
      businessTelNumber: [null],
      mobileNumber: [null],
      email: [null]
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
    this.cs.getClientDetailsList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListClientDetails[] = [];
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
      this.sortBy = 'name';
      this.sortOrder = 'asc';
    }
    this.getList();
  }

  getDetails(row: ListClientDetails) {
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListClientDetails) {
    // this.dialog.open(RequestDetailsModalComponent, {
    //   width: '1000px',
    //   data: details
    // });
  }

  apply() {
    this.getList();
  }

  reset() {
    this.filterForm.get('name').setValue('');
    this.filterForm.get('documentType').setValue('');
    this.filterForm.get('documentCode').setValue('');
    this.filterForm.get('address').setValue('');
    this.filterForm.get('homeTelNumber').setValue('');
    this.filterForm.get('businessTelNumber').setValue('');
    this.filterForm.get('mobileNumber').setValue('');
    this.filterForm.get('email').setValue('');

    this.getList();
  }

}