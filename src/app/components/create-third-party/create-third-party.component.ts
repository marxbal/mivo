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

  constructor(public dialogRef: MatDialogRef < CreateThirdPartyComponent > ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private tpls: ThirdPartyLOVServices) {
  }

  ngOnInit(): void {
    // getting all list of values needed for creating of third party person/organizaion/company
    this.getLOVs();
    this.setData();
    this.setValidations();
  }

  createForm(thirdParty: PolicyHolder) {
    this.tpForm = this.fb.group({
      documentCode: ['', Validators.required],
      documentType: ['', Validators.required],
      policyHolderType: [null],
      prefix: [null],
      suffix: [null],
      firstName: ['', Validators.required],
      middleName: [null],
      lastName: thirdParty.policyHolderType == "P" ? ['', Validators.required] : [null],
      gender: thirdParty.policyHolderType == "P" ? ['', Validators.required] : [null],
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
      personLanguage: thirdParty.policyHolderType == "P" ? ['', Validators.required] : [null],
    });
  }

  setData() {
    this.thirdParty = this.data.policyHolder;
    if (this.thirdParty.documentType == null || this.thirdParty.isExisting) {
      this.thirdParty.policyHolderType = "P"; //person
      this.thirdParty.correspondenceType = 1; //home
      this.thirdParty.personLanguage = "EN" //english
    } else {
      this.getState()
      this.getMunicipality();
      this.getCity();
      this.getZipCode();
    }
    this.createForm(this.thirdParty);
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

  getMunicipality() {
    const _this = this;
    this.tpls.getMunicipality(this.thirdParty).then(res => {
      _this.TPLOV.municipalityLOV = res;
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
    this.thirdParty.isExisting = false;
    this.thirdParty.isOrganization = this.thirdParty.policyHolderType == 'C';
    this.dialogRef.close(this.thirdParty);
  }

  cancel(): void {
    this.dialogRef.close();
  }

}