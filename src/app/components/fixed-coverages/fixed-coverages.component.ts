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
  details: string;
  isHeader: boolean;
  showDetails: boolean;
}

@Component({
  selector: 'app-fixed-coverages',
  templateUrl: './fixed-coverages.component.html',
  styleUrls: ['./fixed-coverages.component.css']
})
export class FixedCoveragesComponent implements OnInit {
  @Input() line: string = 'travel';
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

    let headers = [];
    //coverage headers
    if (this.line == 'travel') {
      headers = [300, 332, 330, 302, 316, 319, 324, 333];
    } else if (this.line = 'accident') {
      headers = [340];
    };

    this.coverageList.forEach(coverage => {
      var obj = {} as coverageDTO;
      // bolder label if it is a header
      obj.isHeader = headers.indexOf(coverage.codCob) !== -1;
      obj.label = obj.isHeader ? '<strong>' + coverage.nomCob + '</strong>' : coverage.nomCob;
      obj.sumInsured = coverage.sumaAseg;
      obj.showDetails = false;


      if (obj.isHeader && obj.code != 330 && obj.code != 332) {
        obj.showDetails = true;
        obj.details = '';
      } else if (obj.sumInsured == null) {
        obj.showDetails = true;
        obj.details = 'n/a';
      } else if (obj.sumInsured == 0) {
        obj.showDetails = true;
        obj.details = obj.isHeader ? '' : 'actual cost';
      }

      //{{element.isHeader && (element.code != '330' && element.code != '332') ? '' : element.sumInsured == null ? 'n/a' : element.sumInsured == 0 ? element.isHeader ? '' : 'actual cost' : element.sumInsured | currency: element.currency: 'symbol-narrow'}}

      if (coverage.codMon == 2) {
        obj.currency = 'USD';
      } else if (coverage.codMon == 3) {
        obj.currency = 'EU';
      } else {
        obj.currency = 'PHP';
      }
      obj.code = coverage.codCob;
      this.coverageData.push(obj);

      //if selected product has hospital cash benefit coverage
      if (this.line == 'accident' && coverage.codCob == 357) {
        obj.showDetails = true;

        obj.label = 'Daily Cash Benefit - up to 365 days only, starting on the first day of Hospital Confinement or after 24 hours of covered accident / Sudden illness';
        obj.details = 'Php 1,000.00/day';
        this.coverageData.push(obj);

        obj.label = '50% increase in Daily Cash Benefit, in case of Intensive Care Unit confinement';
        obj.details = 'Php 1,500.00/day';
        this.coverageData.push(obj);

        obj.label = 'Surgical Cash Benefit for every covered surgery (Subject to Schedule of Surgical Benefits)';
        obj.details = 'max of Php 10,000.00';
        this.coverageData.push(obj);
      }
    });
  }
}