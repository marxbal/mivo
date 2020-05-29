import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import {
  FormGroup,
  FormBuilder
} from '@angular/forms';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  Utility
} from 'src/app/utils/utility';

@Component({
  selector: 'app-individual-policy',
  templateUrl: './individual-policy.component.html',
  styleUrls: ['./individual-policy.component.css']
})
export class IndividualPolicyComponent implements OnInit {
  @Input() details: any;
  loadForm: FormGroup;

  disableLoadBtn: boolean = true;

  //modal reference
  modalRef: BsModalRef;

  constructor(
    private fb: FormBuilder,
    private bms: BsModalService) {
    this.createForm();
    this.setValidations();
  }

  ngOnInit(): void {}

  createForm() {
    this.loadForm = this.fb.group({
      quotationNumber: ['', null],
    });
  }

  setValidations() {
    var quotationNumber = this.loadForm.get('quotationNumber');
    quotationNumber.valueChanges.subscribe(number => {
      this.disableLoadBtn = Utility.isUndefined(number);
    });
  }

}