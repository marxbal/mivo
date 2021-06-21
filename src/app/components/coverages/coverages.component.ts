import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import {
  MatTableDataSource
} from '@angular/material/table';
import {
  FormGroup,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import {
  Car
} from 'src/app/objects/Car';
import {
  MatDialog
} from '@angular/material';
import {
  CoverageVariableDataComponent
} from '../coverage-variable-data/coverage-variable-data.component';
import {
  CoverageVariableData
} from 'src/app/objects/CoverageVariableData';
import {
  Utility
} from 'src/app/utils/utility';
import {
  CarQuoteServices
} from 'src/app/services/car-quote.service';

export interface TablesDTO {
  isMandatory: boolean;
  included: boolean;
  coverage: string;
  options: [];
  sumInsured: number;
  netPremium: number;
  isRoadAssist: boolean;
  isSelect: boolean;
  code: number;
}

@Component({
  selector: 'app-coverages',
  templateUrl: './coverages.component.html',
  styleUrls: ['./coverages.component.css']
})
export class CoveragesComponent implements OnInit {
  @Input() carDetails: Car;
  @Input() coverageList: any[];
  @Input() amountList: any[];
  @Input() coverageVariable: any[];
  @Input() premiumAmount: any[];
  @Input() coverageAmount: any[];
  @Input() coverageVariableData: CoverageVariableData;
  @Input() isModifiedCoverage: boolean;
  @Input() isIssuance: boolean;
  @Input() hasRoadAssist: boolean;

  @Input() quoteForm: FormGroup;
  @Input() showCTPL: boolean;
  @Input()
  set loadCoverage(value: number) {
    this.triggerCounter = value;
    this.generateCoverage();
  }

  @Output() showCTPLChange = new EventEmitter < boolean > ();

  cForm: FormGroup;
  displayedColumns: string[] = ['included', 'coverage', 'sumInsured', 'netPremium', 'action'];
  source: any[] = [];
  dataSource = new MatTableDataSource < TablesDTO > (this.source);
  cvddv: CoverageVariableData;
  triggerCounter: number;

  constructor(
    private fb: FormBuilder,
    private cqs: CarQuoteServices,
    public dialog: MatDialog) {}

  ngOnInit() {
    this.generateCoverage();
  }

  generateCoverage() {
    //getting and setting defaults to variable data
    const cvd = new CoverageVariableData();
    this.cvddv = cvd.getDefaultValues(this.coverageVariable, this.coverageVariableData);
    this.source = this.getCoverageData();
    if (this.source.length) {
      this.dataSource = new MatTableDataSource < TablesDTO > (this.source);
      this.setForm(this.dataSource.filteredData);
    }
  }

  editCoverage(coverage: TablesDTO) {
    var modalData = {
      c: coverage,
      subline: this.carDetails.subline,
      cvd: this.coverageVariableData,
      cvddv: this.cvddv
    };
    const dialogRef = this.dialog.open(CoverageVariableDataComponent, {
      width: '500px',
      data: modalData
    });

    dialogRef.afterClosed().subscribe(result => {
      // if update button is clicked
      if (!Utility.isUndefined(result)) {
        const c = new CoverageVariableData();
        c.validateValues(this.cvddv, this.coverageVariableData);
      }
    });
  }

  private setForm(d: any[]) {
    this.cForm = this.fb.group({
      coverages: this.fb.array([])
    });

    const control = this.cForm.get('coverages') as FormArray;
    d.forEach((coverage) => {
      control.push(this.setCoverageFormArray(coverage));
    });
  }

  updateRow(row: TablesDTO) {
    row.included = !row.included;
    let updateItem = this.source.find(this.findIndexToUpdate, row.coverage);
    let index = this.source.indexOf(updateItem);

    if (row.code == 1020 || row.code == 1008) {
      //if acts of nature or strike and riots is selected
      row.sumInsured = row.included ? this.carDetails.vehicleValue : 0;
    }

    if (row.isRoadAssist) {
      //unselect Road Assits options
      this.unselectRAOptions(row.code);
    }

    this.source[index] = row;

    // updating source
    this.dataSource = new MatTableDataSource < TablesDTO > (this.source);
    this.dataSource._updateChangeSubscription();
    this.dataSource._renderChangesSubscription;
    this.setForm(this.dataSource.filteredData);
  }

  findIndexToUpdate(row: any) {
    return row.coverage === this;
  }

  unselectRAOptions(code: number) {
    this.source.forEach(s => {
      if (s.isRoadAssist && s.code != code) {
        s.included = false;
      }
    });
  }

  get coverages(): FormArray {
    return <FormArray > this.cForm.get('coverages');
  }

  private setCoverageFormArray(coverage: any) {
    return this.fb.group({
      isMandatory: [coverage.isMandatory],
      included: [coverage.included],
      code: [coverage.code],
      coverage: [coverage.coverage],
      options: [coverage.options],
      sumInsured: [coverage.sumInsured],
      netPremium: [coverage.netPremium],
      isRoadAssist: [coverage.isRoadAssist],
      hasVariableData: [coverage.hasVariableData],
      isSelect: [coverage.isSelect]
    });
  }

  private getCoverageData() {
    var returnData: any[] = [];

    this.coverageList.forEach((cov) => {
      var code = parseInt(cov.COD_COB);
      var product = this.carDetails.productList;
      // for testing
      // product = 10002;
      var name = cov.NOM_COB;
      var type = cov.MCA_TIP_CAPITAL;
      var isMandatory = cov.MCA_OBLIGATORIO == "S";
      var included = isMandatory;

      var options = [];
      var isSelect = false;
      var sumInsured = 0;
      var netPremium = 0;

      //gets the net premium per code
      this.premiumAmount.forEach((prem) => {
        if (code == prem.codCob) {
          netPremium = prem.impSpto;
        }
      });

      //gets sum insured per code
      this.coverageAmount.forEach((covAmount) => {
        if (code == covAmount.codCob) {
          sumInsured = covAmount.sumaAseg;
          included = true;
        }
      });

      if (code == 1040 && !included) {
        // checking for product with Road Assist if code is 1040 or ROAD ASSIST
        included = this.hasRoadAssist;
      } else if (code == 1001 && included && this.isIssuance) {
        // opens CTPL panel if code is 1001 or COMP. THIRD PAR. LIAB.
        this.showCTPL = included;
        this.showCTPLChange.emit(this.showCTPL);
        this.cqs.activateCTPL(this.quoteForm, this.carDetails, this.showCTPL);
      }

      if (type == 4) {
        isSelect = true;
        this.amountList.forEach((amount) => {
          if (code == amount.codCob) {
            options.push({
              value: amount.impLimite
            });
          }
        });

        var hasCounterpart = false;
        options.forEach((o) => {
          if (o.value == sumInsured) {
            hasCounterpart = true;
          }
        });

        //if has no counterpart to sum insured select options, gets the first option value
        if (!hasCounterpart) {
          sumInsured = options[0].value;
        }
      } else if (!included) {
        sumInsured = 0;
        netPremium = 0;
      }

      var returnObj = {
        isMandatory: isMandatory,
        included: included,
        code: code,
        coverage: name,
        options: options,
        sumInsured: sumInsured,
        netPremium: netPremium,
        isRoadAssist: (code == 1040),
        hasVariableData: (
          code == 1100 ||
          code == 1002 ||
          code == 1003 ||
          code == 1007 ||
          code == 1008 ||
          code == 1020 ||
          code == 1040),
        isSelect: isSelect
      }

      //exclude to coverages list
      if (
        code != 1006 &&
        code != 1018 &&
        code != 1026 &&
        code != 1027 &&
        code != 1029 &&
        code != 1037 &&
        !(code == 1036 && product == 10001)) {
        returnData.push(returnObj);
      }
    });

    return returnData;
  };
}