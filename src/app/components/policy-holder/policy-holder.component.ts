import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  MatTableDataSource,
  MatPaginator,
  MatDialog
} from '@angular/material';
import {
  Utility
} from 'src/app/utils/utility';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  ThirdPartyService
} from 'src/app/services/third-party.service';
import {
  CreateThirdPartyComponent
} from '../create-third-party/create-third-party.component';
import {
  CarLOVServices
} from 'src/app/services/lov/car.service';


@Component({
  selector: 'app-policy-holder',
  templateUrl: './policy-holder.component.html',
  styleUrls: ['./policy-holder.component.css']
})
export class PolicyHolderComponent implements OnInit {
  @Input() title: String;
  @Input() showCreateBtn: boolean;
  @Input() policyHolder: PolicyHolder;
  @Input() details: any;
  @Input() isIssuance: boolean;
  @Input() isCar: boolean = false;
  @Input() type: String;
  @Input() optional: boolean;
  @Input() editMode: boolean;
  @Input() showPrefix: boolean = true;
  @Input() createList: any[] = [];
  @Input() policyHolderList: {
    primary: string,
    secondary: string,
    assignee: string,
    owner: string,
    driver: string
  };
  @Input()
  set loadQuotation(value: number) {
    this.triggerCounter = value;
    if (!Utility.isUndefined(this.policyHolder.documentCode)) {
      this.phForm.get('documentType').markAsDirty();
      this.phForm.get('documentCode').markAsDirty();
    }
  }

  @Output() policyHolderChange = new EventEmitter < PolicyHolder > ();
  @Output() createListChange = new EventEmitter < any[] > ();
  @Output() policyHolderListChange = new EventEmitter < {} > ();
  
  _details: any;
  triggerCounter: number;

  displayedColumns: string[] = ['documentType', 'firstName', 'middleName', 'lastName', 'address', 'action'];
  source: any[] = [];
  dataSource = new MatTableDataSource(this.source);

  @ViewChild(MatPaginator, {
    static: false
  }) paginator: MatPaginator;

  phForm: FormGroup;
  searchForm: FormGroup;

  //for optional content
  showContent: boolean;

  isDriver: boolean = false;

  showSearch: boolean = false;
  showSearchResult: boolean = false;

  policyHolderType: string;
  firstName: string;
  lastName: string;
  showLastName: boolean = true;

  firstNameLabel: string = "First Name";
  firstNameError: string = "first name";

  prefixLOV: any[];
  separatorLOV: any[];

  //modal reference
  modalRef: BsModalRef;

  driverPolicyHolder: Array < PolicyHolder > = [];

  constructor(
    private fb: FormBuilder,
    private bms: BsModalService,
    private tps: ThirdPartyService,
    private cls: CarLOVServices,
    public dialog: MatDialog) {}

  ngOnInit(): void {
    this.createForm();
    this.setValidations();
    this.showContent = !this.optional;

    if (this.isIssuance) {
      //can only search company/organization if type is mortgagee
      this.policyHolderType = this.type == 'mortgagee' ? 'C' : 'P';
      this.isDriver = this.type === 'driver';

      if (this.type == 'secondary') {
        var _this = this;
        this.cls.getPHPrefix().then(res => {
          _this.prefixLOV = res;
        });
        this.cls.getPHSeparator().then(res => {
          _this.separatorLOV = res;
        });
      }
    }
  }

  createForm() {
    if (this.isIssuance) {
      this.phForm = this.fb.group({
        documentCode: this.optional ? [null] : ['', Validators.required],
        documentType: this.optional ? [null] : ['', Validators.required],
        secondaryPolicyHolderPrefix: [null],
        secondaryPolicyHolderSeparator: [null]
      });
    } else {
      this.phForm = this.fb.group({
        name: ['', Validators.required],
      });
    }

    this.searchForm = this.fb.group({
      policyHolderType: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
  }

  setValidations() {
    var policyHolderType = this.searchForm.get('policyHolderType');
    var lastName = this.searchForm.get('lastName');

    policyHolderType.valueChanges.subscribe(type => {
      this.showLastName = type == "P";
      this.firstNameLabel = type == "P" ? "First Name" : "Company/Organization";
      this.firstNameError = this.firstNameLabel.toLowerCase();
      Utility.updateValidator(lastName, type == "P" ? Validators.required : null);
    });
  }

  browse() {
    this.showSearch = true;
    this.showSearchResult = false;
  }

  create() {
    this.showSearch = false;
    this.showSearchResult = false;

    var label = 
      this.type == 'secondary' ? "Alternative " :
      this.type == 'assignee' ? "Assignee " :
      this.type == 'morgagee' ? "Mortagee " :
      this.type == 'owner' ? "Owner " :
      this.type == 'driver' ? "Driver " : '';

    let title = "Create " + label + "Policy Holder";

    const modalData = {
      title: title,
      policyHolder: this.policyHolder
    };

    const dialogRef = this.dialog.open(CreateThirdPartyComponent, {
      width: '1000px',
      data: modalData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(thirdParty => {
      // if create button is clicked
      if (!Utility.isUndefined(thirdParty)) {
        var tp = thirdParty as PolicyHolder;
        var str = thirdParty.documentType + '-' + thirdParty.documentCode;
        if (this.isCar) {
          if (this.checkDuplicate(str)) {
            this.createList.splice(this.createList.indexOf(str), 1);
            this.createListChange.emit(this.createList);
  
            this.modalRef = Utility.showWarning(this.bms, "You are creating a policy holder with the same document type and document code, please use a different ID.");
            tp.documentCode = '';
            this.setPolicyHolder(tp);
          } else {
            this.createList.push(str);
            this.createListChange.emit(this.createList);
            this.validate(str, tp);
          }
        } else {
          this.setPolicyHolder(tp);
        }
      } else {
        this.clear();
      }
    });
  }

  checkDuplicate(str : string) {
    var isDuplicate = false;
    this.createList.forEach((res) => {
      if (res === str) {
        isDuplicate = true;
      }
    });
    return isDuplicate;
  }

  validate(str: string, tp: PolicyHolder, isAdd?: boolean) {
    if (isAdd) {
      this.showSearch = false;
      this.showSearchResult = false;
    }

    if (this.type == 'primary') {
      if (this.policyHolderList.assignee === str || this.policyHolderList.owner === str || this.policyHolderList.driver === str) {
        this.modalRef = Utility.showWarning(this.bms, "Primary Policy Holder should not be the same to Assignee, Owner or Driver, please choose or create a new one.");
      } else {
        this.policyHolderList.primary = str;
        this.policyHolderListChange.emit(this.policyHolderList);
        this.setPolicyHolder(tp);
      }
    } else if (this.type == 'secondary') {
      this.policyHolderList.secondary = str;
      this.policyHolderListChange.emit(this.policyHolderList);
      this.setPolicyHolder(tp);
    } else if (this.type == 'assignee') {
      if (this.policyHolderList.primary === str) {
        this.modalRef = Utility.showWarning(this.bms, "Assignee Policy Holder should not be the same to Primary Policy Holder, please choose or create a new one.");
      } else {
        this.policyHolderList.assignee = str;
        this.policyHolderListChange.emit(this.policyHolderList);
        this.setPolicyHolder(tp);
      }
    } else if (this.type == 'owner') {
      if (this.policyHolderList.primary === str) {
        this.modalRef = Utility.showWarning(this.bms, "Owner Policy Holder should not be the same to Primary Policy Holder, please choose or create a new one.");
      } else {
        this.policyHolderList.owner = str;
        this.policyHolderListChange.emit(this.policyHolderList);
        this.setPolicyHolder(tp);
      }
    } else if (this.type == 'driver') {
      if (this.policyHolderList.primary === str) {
        this.modalRef = Utility.showWarning(this.bms, "Driver Policy Holder should not be the same to Primary Policy Holder, please choose or create a new one.");
      } else {
        this.policyHolderList.driver = str;
        this.policyHolderListChange.emit(this.policyHolderList);
        this.setPolicyHolder(tp);
      }
    } else {
      this.setPolicyHolder(tp);
    }
  }

  clear() {
    var str = this.policyHolder.documentType + '-' + this.policyHolder.documentCode;
    this.createList.splice(this.createList.indexOf(str), 1);
    this.createListChange.emit(this.createList);

    this.showSearch = false;
    this.showSearchResult = false;
    this.setPolicyHolder(new PolicyHolder());

    if (this.type === 'primary') {
      this.policyHolderList.primary = '';
    } else if (this.type === 'secondary') {
      this.policyHolderList.secondary = '';
    } else if (this.type === 'assignee') {
      this.policyHolderList.assignee = '';
    } else if (this.type === 'owner') {
      this.policyHolderList.owner = '';
    } else if (this.type === 'driver') {
      this.policyHolderList.driver = '';
    }

    this.policyHolderListChange.emit(this.policyHolderList);
  }

  setPolicyHolder(update: PolicyHolder) {
    this.policyHolder = update;
    this.policyHolderChange.emit(this.policyHolder);
    this.phForm.get('documentType').markAsDirty();
    this.phForm.get('documentCode').markAsDirty();
    var id = this.type + '_panel';
    Utility.scroll(id);
  }

  searchResult() {
    this.showSearchResult = false;
    const isPerson = this.policyHolderType == "P";
    this.lastName = isPerson ? this.lastName : "";

    this.tps.getThirdPartyList(1, this.firstName, this.lastName).then((res) => {
      if (res.status) {
        this.source = res.obj as[];
        if (this.source.length) {
          this.showSearchResult = true;
          this.dataSource = new MatTableDataSource(this.source);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
          }, 100);
        } else {
          var completeName = isPerson ? this.firstName + " " + this.lastName : this.firstName;
          this.modalRef = Utility.showInfo(this.bms, "No results for " + completeName);
        }
      } else {
        this.modalRef = Utility.showError(this.bms, res.message);
      }
    });
  }

  enableAddBtn(event: any, input: HTMLInputElement) {
    var val = event.target.value;
    input.disabled = Utility.isEmpty(val);
  }

  add(row: any, input ? : HTMLInputElement) {
    if (Utility.isUndefined(input) || row.codDocum == input.value) {
      var str = row.tipDocum + '-' + row.codDocum;

      var tp = new PolicyHolder();

      tp.isExisting = true;
      tp.isPerson = this.policyHolderType == "P";
      tp.documentCode = row.codDocum;
      tp.documentType = row.tipDocum;
      tp.firstName = this.firstName;
      tp.lastName = this.lastName;

      this.validate(str, tp, true);
    } else {
      var completeName = this.policyHolderType == "P" ? this.firstName + " " + this.lastName : this.firstName;
      this.modalRef = Utility.showError(this.bms, "Incorrect document code entered for " + completeName);
    }
  }
}