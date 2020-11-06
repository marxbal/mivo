import {
  Component,
  OnInit,
  Inject
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material';
import {
  ThirdPartyListObject
} from 'src/app/objects/LOV/thirdPartyList';
import {
  Utility
} from 'src/app/utils/utility';
import {
  ThirdPartyLOVServices
} from 'src/app/services/lov/third-party-lov-service';
import {
  PolicyHolder
} from 'src/app/objects/PolicyHolder';
import {
  ThirdPartyService
} from 'src/app/services/third-party.service';
import {
  BsModalService,
  BsModalRef
} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-third-party',
  templateUrl: './create-third-party.component.html',
  styleUrls: ['./create-third-party.component.css']
})
export class CreateThirdPartyComponent implements OnInit {
  tpForm: FormGroup;
  title: String = this.data.title;
  thirdParty: PolicyHolder = new PolicyHolder();

  TPLOV = new ThirdPartyListObject();

  today: Date = new Date();

  firstNameLabel = "First Name";
  firstNameError = "first name"

  //flag to show data for creating a person policy holder
  showPersonDetails: boolean = true;

  //flag to show data for creating organization/company 
  showOrgDetails: boolean = false;

  //modal reference
  modalRef: BsModalRef;

  constructor(public dialogRef: MatDialogRef < CreateThirdPartyComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private tpls: ThirdPartyLOVServices,
    private tps: ThirdPartyService,
    private bms: BsModalService) {}

  ngOnInit(): void {
    // getting all list of values needed for creating of third party person/organizaion/company
    this.getLOVs();
    this.setData();
    this.setValidations();
  }

  createForm(type: string) {
    this.tpForm = this.fb.group({
      documentCode: ['', Validators.required],
      documentType: ['', Validators.required],
      policyHolderType: [null],
      prefix: [null],
      suffix: [null],
      firstName: ['', Validators.required],
      middleName: [null],
      lastName: type == "P" ? ['', Validators.required] : [null],
      gender: type == "P" ? ['', Validators.required] : [null],
      birthDate: [null],
      mobileNumber: ['', Validators.required],
      correspondenceType: ['', Validators.required],
      country: [null],
      state: [null],
      municipality: [null],
      city: [null],
      address: ['', Validators.required],
      zipcode: [null],
      email: ['', [Validators.required, Validators.email]],

      orgDocumentType: [null],
      orgDocumentCode: [null],
      orgNationality: [null],
      orgFirstName: [null],
      orgLastName: [null],
      orgPost: [null],
      orgTypeOfBusiness: [null],

      personMaritalStatus: [null],
      personProfession: [null],
      personOccupation: [null],
      personNationality: [null],
      personType: [null],
      personLanguage: type == "P" ? ['', Validators.required] : [null],
    });
  }

  setData() {
    const policyHolder = this.data.policyHolder;
    const type = policyHolder.policyHolderType;
    this.createForm(type);
    if (policyHolder.documentType == null || policyHolder.isExisting) {
      this.thirdParty.policyHolderType = "P"; //person
      this.thirdParty.correspondenceType = 1; //home
      this.thirdParty.personLanguage = "EN" //english
    } else {
      this.thirdParty = policyHolder;
      this.tpForm.get('documentType').markAsDirty();
      this.tpForm.get('correspondenceType').markAsDirty();
      if (this.thirdParty.policyHolderType == "P") {
        this.tpForm.get('gender').markAsDirty();
      }
      this.getState()
      this.getProvince();
      this.getCity();
      this.getZipCode();
    }
  }

  setValidations() {
    var policyHolderType = this.tpForm.get('policyHolderType');
    var lastName = this.tpForm.get('lastName');
    var gender = this.tpForm.get('gender');

    policyHolderType.valueChanges.subscribe(type => {
      this.showPersonDetails = type == "P";
      this.showOrgDetails = type == "C";
      this.firstNameLabel = type == "P" ? "First Name" : "Company/Organization";
      this.firstNameError = this.firstNameLabel.toLocaleLowerCase();
      Utility.updateValidator(lastName, type == "P" ? Validators.required : null);
      Utility.updateValidator(gender, type == "P" ? Validators.required : null);
    });
  }

  getLOVs() {
    const _this = this;
    this.tpls.getDocumentType().then(res => {
      _this.TPLOV.documentTypeLOV = res;
    });
    this.tpls.getPrefix().then(res => {
      _this.TPLOV.prefixLOV = res;
    });
    this.tpls.getSuffix().then(res => {
      _this.TPLOV.suffixLOV = res;
    });
    this.tpls.getCorrespondenceType().then(res => {
      _this.TPLOV.correspondenceTypeLOV = res;
    });
    this.tpls.getCountry().then(res => {
      _this.TPLOV.countryLOV = res;
    });
    this.tpls.getNationality().then(res => {
      _this.TPLOV.nationalityLOV = res;
    });
    this.tpls.getPost().then(res => {
      _this.TPLOV.orgPostLOV = res;
    });
    this.tpls.getTypeOfBusiness().then(res => {
      _this.TPLOV.orgTypeOfBusinessLOV = res;
    });
    this.tpls.getMaritalStatus().then(res => {
      _this.TPLOV.personMaritalStatusLOV = res;
    });
    this.tpls.getProfession().then(res => {
      _this.TPLOV.personProfessionLOV = res;
      _this.TPLOV.personOccupationLOV = res;
    });
    this.tpls.getType().then(res => {
      _this.TPLOV.personTypeLOV = res;
    });
    this.tpls.getLanguage().then(res => {
      _this.TPLOV.personLanguageLOV = res;
    });
  }

  getState() {
    const _this = this;
    this.tpls.getState(this.thirdParty).then(res => {
      _this.TPLOV.stateLOV = res;
    });
  }

  getProvince() {
    const _this = this;
    this.tpls.getProvince(this.thirdParty).then(res => {
      _this.TPLOV.provinceLOV = res;
    });
  }

  getCity() {
    const _this = this;
    this.tpls.getCity(this.thirdParty).then(res => {
      _this.TPLOV.cityLOV = res;
    });
  }

  getZipCode() {
    const _this = this;
    this.tpls.getZipCode(this.thirdParty).then(res => {
      _this.TPLOV.zipcodeLOV = res;
    });
  }

  create(): void {
    this.tps.getThirdPartyDetails(this.thirdParty.documentType, this.thirdParty.documentCode).then((res) => {
      if (res.status) {
        this.modalRef = Utility.showWarning(this.bms, "Client information is already existing in the system. Search the client instead or create with a different document ID.");
      } else {
        this.thirdParty.isExisting = false;
        this.thirdParty.isPerson = this.thirdParty.policyHolderType == 'P';
        this.dialogRef.close(this.thirdParty);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

}