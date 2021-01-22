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
  Utility
} from 'src/app/utils/utility';
import {
  ClientService
} from 'src/app/services/client.service';
import {
  ViewDetailsModalComponent
} from '../view-details-modal/view-details-modal.component';
import {
  ListPolicyCancelled
} from 'src/app/objects/ListPolicyCancelled';
import {
  page
} from '../../constants/page';

const ELEMENT_DATA: ListPolicyCancelled[] = [{
  policyNumber: "0129328302323",
  policyEffectivityDate: "11/11/11",
  line: "PC",
  policyHolder: "LEBRON JAMES",
  source: "MIVO",
  type: "POLICYACTIVE"
}];

@Component({
  selector: 'app-client-policy-cancelled-list',
  templateUrl: './client-policy-cancelled-list.component.html',
  styleUrls: ['./client-policy-cancelled-list.component.css']
})
export class ClientPolicyCancelledListComponent implements OnInit {

  displayedColumns: string[] = ['policyNumber', 'policyEffectivityDate', 'line', 'policyHolder', 'source'];
  dataSource = new MatTableDataSource();

  sourceItems: any[] = ['MIVO', 'TRONWEB'];

  pageFilter: PageFilter = new PageFilter();

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
      line: [null],
      policyHolder: [null],
      source: [null]
    });
  }

  setPageFilters() {
    this.pageFilter.currentPage = this.currentPage;
    this.pageFilter.pageSize = this.pageSize;
    this.pageFilter.sortBy = this.sortBy;
    this.pageFilter.sortOrder = this.sortOrder;

    this.pageFilter.pcEffectivityDate = Utility.convertDatePickerDate(this.pageFilter.pcEffectivityDate);
  }

  getList() {
    this.setPageFilters();
    this.cs.getPolicyCancelledList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListPolicyCancelled[] = [];
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

  getDetails(row: ListPolicyCancelled) {
    row.type = page.CLI.CAN;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListPolicyCancelled) {
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
    this.filterForm.get('line').setValue('');
    this.filterForm.get('policyHolder').setValue('');
    this.filterForm.get('source').setValue('');

    this.getList();
  }

}