import {
  Component,
  OnInit,
  Input
} from '@angular/core';

export interface coverageDTO {
  label: string;
  sumInsured: number;
  currency: string;
  code: number;
  isHeader: boolean;
}

@Component({
  selector: 'app-fixed-coverages',
  templateUrl: './fixed-coverages.component.html',
  styleUrls: ['./fixed-coverages.component.css']
})
export class FixedCoveragesComponent implements OnInit {
  @Input() coverageList: any[] = [];
  @Input()
  set loadCoverage(value: number) {
    this.triggerCounter = value;
    this.generateCoverage();
  }

  displayedColumns: string[] = ['label', 'sumInsured'];
  coverageData: Array < coverageDTO > = [];
  triggerCounter: number;

  constructor() {}

  ngOnInit(): void {
    this.generateCoverage();
  }

  generateCoverage() {
    this.coverageData = [];

    //coverage headers
    var headers = [300, 332, 330, 302, 316, 319, 324, 333];
    this.coverageList.forEach(coverage => {
      var obj = {} as coverageDTO;
      // bolder label if it is a header
      obj.isHeader = headers.indexOf(coverage.code) !== -1;
      obj.label = obj.isHeader ? '<strong>' + coverage.label + '</strong>' : coverage.label;
      obj.sumInsured = coverage.sumInsured;
      obj.currency = coverage.currency;
      obj.code = coverage.code;
      this.coverageData.push(obj);
    });
  }
}