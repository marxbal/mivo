import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UtilitiesQueryFilter } from '../../objects/UtilitiesQueryFilter';
import { UtilityQueryService } from 'src/app/services/utility-query.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Utility  } from 'src/app/utils/utility';

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
    private bms: BsModalService, ) { }

  ngOnInit() {}

  search() {
    if (this.inputVal.nativeElement.value === '') {
      this.modalRef = Utility.showError(this.bms, 'Search value is empty.');
    } else {
      this.filter.userName = localStorage.getItem('username')
      this.filter.param = this.inputVal.nativeElement.value;
      this.filter.inquiryType = this.selectedOption === 'policy' ? 'GETPOLICYDETAILS' : 'GETCLAIMDETAILS';
      this.filter.paramName = this.selectedOption;

      this.utilityQueryService.getSearchResult(this.filter).then((res) => {
          if (res) {
            const jsonData = JSON.parse(JSON.stringify(res));
            window.open(jsonData.obj, '_blank');
          }
        }
      );
    }
  }

  onSelectOption(opt: string) {
    this.optPlaceholder = (opt === 'policy' ? 'Policy Number' : 'Claim Number');
  }

}
