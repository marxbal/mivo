import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  UtilitiesQueryFilter
} from '../../objects/UtilitiesQueryFilter';
import {
  UtilityQueryService
} from 'src/app/services/utility-query.service';
import {
  BsModalRef,
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  Utility
} from 'src/app/utils/utility';
import {
  MIVO_LOGIN
} from "../../constants/local.storage";

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {
  selectedOption = 'policy';
  optPlaceholder = 'Policy Number';
  filter: UtilitiesQueryFilter = new UtilitiesQueryFilter();
  modalRef: BsModalRef;

  @ViewChild('inputVal') inputVal: ElementRef;

  constructor(
    private utilityQueryService: UtilityQueryService,
    private bms: BsModalService, ) {}

  ngOnInit() {}

  search() {
    if (this.inputVal.nativeElement.value === '') {
      this.modalRef = Utility.showError(this.bms, 'Search value is empty.');
    } else {
      const userName = JSON.parse(localStorage.getItem(MIVO_LOGIN)).username

      if (userName != null) {
        this.filter.userName = userName
        this.filter.param = this.inputVal.nativeElement.value;
        this.filter.inquiryType = this.selectedOption === 'policy' ? 'GETPOLICYDETAILS' : 'GETCLAIMDETAILS';
        this.filter.paramName = this.selectedOption;

        this.utilityQueryService.getSearchResult(this.filter).then((res) => {
          if (res) {
            const jsonData = JSON.parse(JSON.stringify(res));
            window.open(jsonData.obj, '_blank');
          }
        });
      } else {
        this.modalRef = Utility.showError(this.bms, 'No login credentials found!');
      }
    }
  }

  onSelectOption(opt: string) {
    this.optPlaceholder = (opt === 'policy' ? 'Policy Number' : 'Claim Number');
  }

}
