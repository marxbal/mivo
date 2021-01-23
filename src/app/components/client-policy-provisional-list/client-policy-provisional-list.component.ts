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
  ListPolicyProvisional
} from 'src/app/objects/ListPolicyProvisional';
import {
  page
} from '../../constants/page';

const ELEMENT_DATA: ListPolicyProvisional[] = [{
  policyNumber: "0129328302323",
  policyEffectivityDate: "11/11/11",
  policyDueDate: "11/11/12",
  line: "PAS",
  policyHolder: "LEBRON JAMES",
  source: "PASS20202",
  type: "POLICYACTIVE"
}];

@Component({
  selector: 'app-client-policy-provisional-list',
  templateUrl: './client-policy-provisional-list.component.html',
  styleUrls: ['./client-policy-provisional-list.component.css']
})
export class ClientPolicyProvisionalListComponent implements OnInit {

  displayedColumns: string[] = ['policyNumber', 'policyEffectivityDate', 'policyDueDate', 'line', 'policyHolder', 'source'];
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

    this.pageFilter.ppEffectivityDate = Utility.convertDatePickerDate(this.pageFilter.ppEffectivityDate);
    this.pageFilter.ppDueDate = Utility.convertDatePickerDate(this.pageFilter.ppDueDate);
  }

  getList() {
    this.setPageFilters();
    this.cs.getPolicyProvisionalList(this.pageFilter).then((res) => {
      if (res.status) {
        let data: ListPolicyProvisional[] = [];
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

  getDetails(row: ListPolicyProvisional) {
    row.type = page.CLI.PRO;
    this.openDetailsModal(row);
  }

  openDetailsModal(details: ListPolicyProvisional) {
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