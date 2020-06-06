import {
  Component,
  OnInit
} from '@angular/core';
import {
  BsModalRef
} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  className: string;
  title: string;
  message: string;
  items: any[];
  isHtml: boolean;
  isConfirm: boolean;
  isOkay: boolean;
  isClose: boolean;
  isCancel: boolean;
  icon: string = 'fa-smile';
  btnClass: string = 'default';

  constructor(
    private bsModalRef: BsModalRef) {}

  ngOnInit(): void {
    if (this.title == "Error") {
      this.icon = 'fa-times';
      this.btnClass = 'danger';
    } else if (this.title == "Warning") {
      this.icon = 'fa-exclamation';
    } else if (this.title == "Info") {
      this.icon = 'fa-info';
      this.btnClass = 'primary';
    }
  }

  confirm() {
    this.close();
  }

  okay() {
    this.bsModalRef.hide();
  }

  close() {
    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

}
