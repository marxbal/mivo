import {
  Component,
  OnInit,
  Input,
  ViewChild
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
  @Input() type: String;
  @Input() optional: boolean;
  _details: any;

  displayedColumns: string[] = ['documentType', 'firstName', 'middleName', 'lastName', 'address', 'action'];
  source: any[];
  dataSource = new MatTableDataSource(this.source);

  @ViewChild(MatPaginator, {
    static: false
  }) paginator: MatPaginator;

  phForm: FormGroup;
  searchForm: FormGroup;

  //for optional content
  showContent: boolean;

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


    var label = this.type == 'secondary' ? "Alternative " :
      this.type == 'assignee' ? "Assignee " :
      this.type == 'morgagee' ? "Mortagee " : '';

    let title = "Create " + label + "Policy Holder";

    const modalData = {
      title: title,
      policyHolder: this.policyHolder
    };

    const dialogRef = this.dialog.open(CreateThirdPartyComponent, {
      width: '1000px',
      data: modalData
    });

    dialogRef.afterClosed().subscribe(thirdParty => {
      // if create button is clicked
      if (!Utility.isUndefined(thirdParty)) {
        this.policyHolder = thirdParty;
        this.phForm.get('documentType').markAsDirty();
        this.phForm.get('documentCode').markAsDirty();
        var id = this.type + '_panel';
        Utility.scroll(id);
      }
    });
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

  add(row: any, input?: HTMLInputElement) {
    if (Utility.isUndefined(input) || row.codDocum == input.value) {
      this.policyHolder.isExisting = true;
      this.policyHolder.isOrganization = this.policyHolderType == "C";
      this.policyHolder.documentCode = row.codDocum;
      this.policyHolder.documentType = row.tipDocum;
      this.phForm.get('documentType').markAsDirty();
      this.phForm.get('documentCode').markAsDirty();
      this.showSearch = false;
      this.showSearchResult = false;
      var id = this.type + '_panel';
      Utility.scroll(id);
    } else {
      var completeName = this.policyHolderType == "P" ? this.firstName + " " + this.lastName : this.firstName;
      this.modalRef = Utility.showError(this.bms, "Incorrect document code entered for " + completeName);
    }
  }
}

const thirdPartyList: any[] = [{
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "P99999",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "MANILA",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "P00000000",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "MAKATI CITY",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "DRI",
  "codDocum": "DRI-77777",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "BUENAVISTA",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "P77777",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "SANTO TOMAS",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "P1232131",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "MANGALDAN",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "P1111111",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "MANILA",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "231123",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "MAKATI CITY",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "9876111",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "MAKATI CITY",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "TIN",
  "codDocum": "441-724-648-000",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "LAS PIÑAS CITY",
  "codActTercero": "1"
}, {
  "codCia": 1,
  "tipDocum": "PAS",
  "codDocum": "02-3499027-4",
  "ape2Tercero": "MANAOIS",
  "nomTercero": "PATRICK",
  "nom2Tercero": "AMIAN",
  "dirDomicilioCliente": "LAS PIÑAS CITY",
  "codActTercero": "1"
}];

const coverageList: any[] = [{
  "MCA_TIP_CAPITAL": "4",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1001",
  "IMP_CALCULO": "0",
  "NOM_COB": "COMP. THIRD PAR. LIAB."
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1100",
  "IMP_CALCULO": "0",
  "NOM_COB": "LOSS AND DAMAGE"
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1002",
  "IMP_CALCULO": "0",
  "NOM_COB": "OWN DAMAGE"
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1003",
  "IMP_CALCULO": "0",
  "NOM_COB": "THEFT"
}, {
  "MCA_TIP_CAPITAL": "4",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1004",
  "IMP_CALCULO": "0",
  "NOM_COB": "VTPL-BODILY INJURY"
}, {
  "MCA_TIP_CAPITAL": "4",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1005",
  "IMP_CALCULO": "0",
  "NOM_COB": "VTPL-PROPERTY DAMAGE"
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1007",
  "IMP_CALCULO": "0",
  "NOM_COB": "UNNAMED PASS. P.A."
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1008",
  "IMP_CALCULO": "0",
  "NOM_COB": "ACTS OF NATURE"
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1020",
  "IMP_CALCULO": "0",
  "NOM_COB": "STRIKE AND RIOTS"
}, {
  "MCA_TIP_CAPITAL": "4",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1026",
  "IMP_CALCULO": "0",
  "NOM_COB": "ACCD'L DEATH/DISABL."
}, {
  "MCA_TIP_CAPITAL": "",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1040",
  "IMP_CALCULO": "0",
  "NOM_COB": "ROAD ASSIST"
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1029",
  "IMP_CALCULO": "360",
  "NOM_COB": "ROAD ASSIST 100"
}, {
  "MCA_TIP_CAPITAL": "",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1027",
  "IMP_CALCULO": "500",
  "NOM_COB": "MAPFRE ROAD ASSIST"
}, {
  "MCA_TIP_CAPITAL": "4",
  "MCA_OBLIGATORIO": "S",
  "COD_COB": "1036",
  "IMP_CALCULO": "1",
  "NOM_COB": "PERSONAL PROPERTY COVER"
}];