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
  source: any[];
  dataSource = new MatTableDataSource < TablesDTO > (this.source);
  cvddv: CoverageVariableData;
  triggerCounter: number;

  constructor(
    private fb: FormBuilder,
    private cqs: CarQuoteServices,
    public dialog: MatDialog) {}

  ngOnInit() {
    // for testing purposes
    // this.coverageList = coverageList;
    // this.amountList = amountList;
    // this.coverageVariable = coverageVariable;
    // this.premiumAmount = premiumAmount;
    // this.coverageAmount = coverageAmount2;
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
    } else if (row.code == 1001 && this.isIssuance) {
      //open CTPL panel
      this.showCTPL = row.included;
      this.showCTPLChange.emit(this.showCTPL);
      this.cqs.activateCTPL(this.quoteForm, this.carDetails, this.showCTPL);
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
        // this.showCTPL = included;
        // this.showCTPLChange.emit(this.showCTPL);
        // this.cqs.activateCTPL(this.quoteForm, this.carDetails, this.showCTPL);
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

// private getData() {
//   var returnData: any[] = [];

//   this.coverageList.forEach((cov) => {
//     var code = parseInt(cov.COD_COB);
//     var vehicleValue = this.carDetails.vehicleValue;
//     var product = this.carDetails.productList;
//     // for testing
//     // vehicleValue = 775000;
//     // product = 10001;
//     var name = cov.NOM_COB;
//     var type = cov.MCA_TIP_CAPITAL;
//     var isMandatory = cov.MCA_OBLIGATORIO == "S";
//     var included = isMandatory;

//     var options = [];
//     var isSelect = false;
//     var sumaAsegA = 0;
//     var netPremium = 0;

//     this.premiumAmount.forEach((prem) => {
//       if (code == prem.codCob) {
//         netPremium = prem.impSpto;
//       }
//     });

//     var hasRAIncluded = false;
//     this.coverageAmount.forEach((covAmount) => {
//       if (covAmount.codCob == 1040 || covAmount.codCob == 1029 || covAmount.codCob == 1027) {
//         hasRAIncluded = true;
//       }

//       if (code == covAmount.codCob) {
//         sumaAsegA = covAmount.sumaAseg;
//         included = true;
//       }
//     });

//     if (code == 1040 && !hasRAIncluded) {
//       included = this.hasRoadAssist;
//     } else if (code == 1001 && included && this.isIssuance) {
//       this.showCTPL = included;
//       this.showCTPLChange.emit(this.showCTPL);
//       this.cqs.activateCTPL(this.quoteForm, this.carDetails, this.showCTPL);
//     }

//     var k = 0;
//     var selectedOpt = "";
//     if (type == 4) {
//       isSelect = true;
//       // if (code == 1036 || code == 1001) {
//       //   // isSelect = true;
//       //   // create += '<td class="col-md-3">' +
//       //   //   '<select disabled="disabled" style="width:100%" onChange="updateSumaAseg(' +
//       //   //   cod_cob + ')" id="' + cod_cob + '">' +
//       //   //   suma_asegDD + '</select>' + '</td>';
//       // } else {
//       //   // selectMandatoryCov
//       // }

//       this.amountList.forEach((amount) => {
//         if (code == amount.codCob) {
//           k = +k + +1;
//           if (k == 1) {
//             if (sumaAsegA == 0) {
//               sumaAsegA = amount.impLimite;
//             }
//           }

//           if (sumaAsegA == amount.impLimite) {
//             selectedOpt = amount.impLimite;
//           }

//           options.push({
//             value: amount.impLimite
//           });
//         }
//       });
//     } else if (type == 5) {
//       //do nothing
//     } else if (type == 3) {
//       this.amountList.forEach((amount) => {
//         if (code == amount.codCob) {
//           k = +k + +1;
//           if (k == 1) {
//             vehicleValue = sumaAsegA;
//           }
//         }
//       });
//       vehicleValue = sumaAsegA;
//     } else {
//       vehicleValue = sumaAsegA;
//     }

//     let sumInsured = isMandatory ? vehicleValue : isSelect ? selectedOpt : 0;
//     if (isSelect) {
//       var hasCounterpart = false;
//       options.forEach((o) => {
//         if (o.value == sumInsured) {
//           hasCounterpart = true;
//         }
//       });
//       //if has no counterpart to sum insured select options, gets the first option value
//       if (!hasCounterpart) {
//         sumInsured = options[0].value;
//       }
//     }

//     var returnObj = {
//       isMandatory: isMandatory,
//       included: included,
//       code: code,
//       coverage: name,
//       options: options,
//       sumInsured: sumInsured,
//       netPremium: netPremium,
//       isRoadAssist: (
//         code == 1027 ||
//         code == 1029 ||
//         code == 1040),
//       hasVariableData: (
//         code == 1100 ||
//         code == 1002 ||
//         code == 1003 ||
//         code == 1007 ||
//         code == 1008 ||
//         code == 1020 ||
//         code == 1029 ||
//         code == 1040),
//       isSelect: isSelect
//     }

//     //exclude to coverages list
//     if (code != 1018 &&
//       code != 1037 &&
//       code != 1026 &&
//       !(code == 1036 && product == 10001)) {
//       returnData.push(returnObj);
//     }
//   });

//   return returnData;
// };

// function generateCoverageAmountByProduct(obj, quoteDetail, isLoadQuotation) {
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
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1004",
  "IMP_CALCULO": "0",
  "NOM_COB": "VTPL-BODILY INJURY"
}, {
  "MCA_TIP_CAPITAL": "4",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1005",
  "IMP_CALCULO": "0",
  "NOM_COB": "VTPL-PROPERTY DAMAGE"
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1007",
  "IMP_CALCULO": "0",
  "NOM_COB": "UNNAMED PASS. P.A."
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1018",
  "IMP_CALCULO": "0",
  "NOM_COB": "UPPA - MR"
}, {
  "MCA_TIP_CAPITAL": "5",
  "MCA_OBLIGATORIO": "N",
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
  "MCA_TIP_CAPITAL": "4",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1006",
  "IMP_CALCULO": "0",
  "NOM_COB": "CSL-BI/PD"
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
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1036",
  "IMP_CALCULO": "1",
  "NOM_COB": "PERSONAL PROPERTY COVER"
}, {
  "MCA_TIP_CAPITAL": "",
  "MCA_OBLIGATORIO": "N",
  "COD_COB": "1037",
  "IMP_CALCULO": "150",
  "NOM_COB": "ALTERNATIVE TRANSPORT BENEFIT"
}];

const amountList: any[] = [{
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1001,
  "codLimite": 1,
  "nomLimite": "100000",
  "impLimite": 100000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "RGCASTRO",
  "fecActu": "2016-06-01 18:23:53.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 1,
  "nomLimite": "50000",
  "impLimite": 50000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 2,
  "nomLimite": "75000",
  "impLimite": 75000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 3,
  "nomLimite": "100000",
  "impLimite": 100000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 4,
  "nomLimite": "150000",
  "impLimite": 150000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 5,
  "nomLimite": "200000",
  "impLimite": 200000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 6,
  "nomLimite": "250000",
  "impLimite": 250000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 7,
  "nomLimite": "300000",
  "impLimite": 300000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 8,
  "nomLimite": "400000",
  "impLimite": 400000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 9,
  "nomLimite": "500000",
  "impLimite": 500000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 10,
  "nomLimite": "750000",
  "impLimite": 750000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 11,
  "nomLimite": "1000000",
  "impLimite": 1000000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 12,
  "nomLimite": "2000000",
  "impLimite": 2000000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2018-03-13 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1004,
  "codLimite": 13,
  "nomLimite": "1500000",
  "impLimite": 1500000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2019-08-02 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 1,
  "nomLimite": "50000",
  "impLimite": 50000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 2,
  "nomLimite": "75000",
  "impLimite": 75000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 3,
  "nomLimite": "100000",
  "impLimite": 100000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 4,
  "nomLimite": "150000",
  "impLimite": 150000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 5,
  "nomLimite": "200000",
  "impLimite": 200000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 6,
  "nomLimite": "250000",
  "impLimite": 250000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 7,
  "nomLimite": "300000",
  "impLimite": 300000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 8,
  "nomLimite": "400000",
  "impLimite": 400000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 9,
  "nomLimite": "500000",
  "impLimite": 500000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 10,
  "nomLimite": "750000",
  "impLimite": 750000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 11,
  "nomLimite": "1000000",
  "impLimite": 1000000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 12,
  "nomLimite": "2000000",
  "impLimite": 2000000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2018-03-13 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1005,
  "codLimite": 13,
  "nomLimite": "3000000",
  "impLimite": 3000000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2019-08-02 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 1,
  "nomLimite": "50000",
  "impLimite": 50000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 2,
  "nomLimite": "75000",
  "impLimite": 75000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 3,
  "nomLimite": "100000",
  "impLimite": 100000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 4,
  "nomLimite": "150000",
  "impLimite": 150000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 5,
  "nomLimite": "200000",
  "impLimite": 200000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 6,
  "nomLimite": "250000",
  "impLimite": 250000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 7,
  "nomLimite": "300000",
  "impLimite": 300000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 8,
  "nomLimite": "400000",
  "impLimite": 400000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 9,
  "nomLimite": "500000",
  "impLimite": 500000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 10,
  "nomLimite": "750000",
  "impLimite": 750000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1006,
  "codLimite": 11,
  "nomLimite": "1000000",
  "impLimite": 1000000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1026,
  "codLimite": 1,
  "nomLimite": "50000",
  "impLimite": 50000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2017-04-25 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1026,
  "codLimite": 2,
  "nomLimite": "100000",
  "impLimite": 100000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "RGCASTRO",
  "fecActu": "2015-10-19 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1026,
  "codLimite": 3,
  "nomLimite": "250000",
  "impLimite": 250000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "CMJUBILO",
  "fecActu": "2017-03-31 11:38:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1029,
  "codLimite": 1,
  "nomLimite": "100000",
  "impLimite": 100000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1036,
  "codLimite": 1,
  "nomLimite": "2000",
  "impLimite": 2000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1036,
  "codLimite": 2,
  "nomLimite": "3000",
  "impLimite": 3000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2018-05-22 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1036,
  "codLimite": 3,
  "nomLimite": "5000",
  "impLimite": 5000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2019-01-17 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1038,
  "codLimite": 1,
  "nomLimite": "250000",
  "impLimite": 250000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1102,
  "codLimite": 1,
  "nomLimite": "50000",
  "impLimite": 50000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2016-07-08 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1102,
  "codLimite": 2,
  "nomLimite": "100000",
  "impLimite": 100000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1102,
  "codLimite": 3,
  "nomLimite": "200000",
  "impLimite": 200000,
  "impLimiteSup": null,
  "mcaLimiteDef": "S",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "JEFFOJA",
  "fecActu": "2016-07-08 00:00:00.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1102,
  "codLimite": 4,
  "nomLimite": "300000",
  "impLimite": 300000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1102,
  "codLimite": 5,
  "nomLimite": "400000",
  "impLimite": 400000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}, {
  "codCia": 1,
  "codRamo": 100,
  "codModalidad": 99999,
  "codCob": 1102,
  "codLimite": 6,
  "nomLimite": "500000",
  "impLimite": 500000,
  "impLimiteSup": null,
  "mcaLimiteDef": "N",
  "mcaInh": "N",
  "fecValidez": "2014-05-01 00:00:00.0",
  "codUsr": "TRON2000",
  "fecActu": "2015-06-25 22:44:34.0"
}];

const configList: any[] = [{
  "codCia": 1,
  "codRamo": "100",
  "codModalidad": "99999",
  "codCob": "1020",
  "mcaTipCapitalF": "F"
}, {
  "codCia": 1,
  "codRamo": "100",
  "codModalidad": "99999",
  "codCob": "1008",
  "mcaTipCapitalF": "F"
}]

const premiumAmount: any[] = [{
  "codCob": 9998,
  "numRiesgo": 0,
  "impSpto": 5602.5
}, {
  "codCob": 1007,
  "numRiesgo": 1,
  "impSpto": 900
}, {
  "codCob": 1005,
  "numRiesgo": 1,
  "impSpto": 1245
}, {
  "codCob": 1036,
  "numRiesgo": 1,
  "impSpto": 0
}, {
  "codCob": 1004,
  "numRiesgo": 1,
  "impSpto": 420
}, {
  "codCob": 1002,
  "numRiesgo": 1,
  "impSpto": 9477
}, {
  "codCob": 1003,
  "numRiesgo": 1,
  "impSpto": 6318
}, {
  "codCob": 1008,
  "numRiesgo": 1,
  "impSpto": 4050
}, {
  "codCob": 1040,
  "numRiesgo": 1,
  "impSpto": 0
}];

const coverageAmount2: any[] = [{
  "codCia": 1,
  "numPoliza": "1002002006184",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1002,
  "codRamo": 100,
  "numSecu": 3,
  "sumaAseg": 1035000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 1035000,
  "tasaCob": 13,
  "codFranquicia": 2,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": 2000,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "1002002006184",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1003,
  "codRamo": 100,
  "numSecu": 4,
  "sumaAseg": 1035000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 1035000,
  "tasaCob": 9,
  "codFranquicia": 2,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": 2000,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "1002002006184",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1004,
  "codRamo": 100,
  "numSecu": 5,
  "sumaAseg": 500000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 500000,
  "tasaCob": 1,
  "codFranquicia": null,
  "codLimite": 9,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "1002002006184",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1005,
  "codRamo": 100,
  "numSecu": 6,
  "sumaAseg": 500000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 500000,
  "tasaCob": 3,
  "codFranquicia": null,
  "codLimite": 9,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "1002002006184",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1040,
  "codRamo": 100,
  "numSecu": 16,
  "sumaAseg": 0,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 0,
  "tasaCob": 250000,
  "codFranquicia": null,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 0,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "1002002006184",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1100,
  "codRamo": 100,
  "numSecu": 2,
  "sumaAseg": 1035000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 1035000,
  "tasaCob": 0,
  "codFranquicia": null,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 0,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": null,
  "impAgrRelSpto": null,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}];

const coverageAmount: any[] = [{
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1002,
  "codRamo": 100,
  "numSecu": 3,
  "sumaAseg": 810000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 810000,
  "tasaCob": 13,
  "codFranquicia": 2,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": 2000,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1003,
  "codRamo": 100,
  "numSecu": 4,
  "sumaAseg": 810000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 810000,
  "tasaCob": 9,
  "codFranquicia": 2,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": 2000,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1004,
  "codRamo": 100,
  "numSecu": 5,
  "sumaAseg": 200000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 200000,
  "tasaCob": 2,
  "codFranquicia": null,
  "codLimite": 5,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1005,
  "codRamo": 100,
  "numSecu": 6,
  "sumaAseg": 200000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 200000,
  "tasaCob": 6,
  "codFranquicia": null,
  "codLimite": 5,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1007,
  "codRamo": 100,
  "numSecu": 7,
  "sumaAseg": 450000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 450000,
  "tasaCob": 2,
  "codFranquicia": null,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1008,
  "codRamo": 100,
  "numSecu": 9,
  "sumaAseg": 810000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 810000,
  "tasaCob": 5,
  "codFranquicia": 2,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 101,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": 2000,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1036,
  "codRamo": 100,
  "numSecu": 20,
  "sumaAseg": 2000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 2000,
  "tasaCob": 0,
  "codFranquicia": null,
  "codLimite": 1,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 0,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1040,
  "codRamo": 100,
  "numSecu": 16,
  "sumaAseg": 0,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 0,
  "tasaCob": 250000,
  "codFranquicia": null,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 0,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": 0,
  "impAgrRelSpto": 0,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}, {
  "codCia": 1,
  "numPoliza": "9990000308905",
  "numSpto": 0,
  "numApli": 0,
  "numSptoApli": 0,
  "numRiesgo": 1,
  "numPeriodo": 1,
  "codCob": 1100,
  "codRamo": 100,
  "numSecu": 2,
  "sumaAseg": 810000,
  "impUnidad": null,
  "pctParticipacion": null,
  "codMonCapital": 1,
  "sumaAsegBajaStro": null,
  "sumaAsegSpto": 810000,
  "tasaCob": 0,
  "codFranquicia": null,
  "codLimite": null,
  "sumaAsegSup": null,
  "mcaBajaRiesgo": "N",
  "mcaVigente": "S",
  "mcaVigenteApli": "S",
  "mcaBajaCob": "N",
  "codSeccReas": 0,
  "impAgr": 0,
  "impAgrRel": null,
  "impAgrSpto": null,
  "impAgrRelSpto": null,
  "mesBaseRegulariza": null,
  "anioBaseRegulariza": null,
  "pctEnfermedad": null,
  "duracionProfesion": null,
  "pctProfesion": null,
  "duracionEnfermedad": null,
  "valFranquiciaMin": null,
  "valFranquiciaMax": null,
  "sumaAsegBajaStroAcc": null
}];

const coverageVariable = [{
  "codCob": 1001,
  "numSecu": 1,
  "codCampo": "MCA_AUTO_REGISTRO",
  "nomCampo": "AUTOMATIC AUTHENTICATION",
  "valCampo": null
}, {
  "codCob": 1001,
  "numSecu": 2,
  "codCampo": "TIP_COCAF_REGISTRATION",
  "nomCampo": "REGISTRATION TYPE",
  "valCampo": null
}, {
  "codCob": 1001,
  "numSecu": 3,
  "codCampo": "TIP_COCAF_MV",
  "nomCampo": "MV TYPE",
  "valCampo": null
}, {
  "codCob": 1001,
  "numSecu": 4,
  "codCampo": "NUM_COC",
  "nomCampo": "COC NUMBER",
  "valCampo": null
}, {
  "codCob": 1001,
  "numSecu": 5,
  "codCampo": "NUM_COC_AUTH",
  "nomCampo": "AUTHENTICATION NUMBER",
  "valCampo": null
}, {
  "codCob": 1002,
  "numSecu": 1,
  "codCampo": "VAL_OD_SPECIAL_DEDUCTIBLE",
  "nomCampo": "OWN DAMAGE SPECIAL DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1002,
  "numSecu": 2,
  "codCampo": "IMP_OD_DEDUCTIBLE",
  "nomCampo": "OWN DAMAGE DEDUCTIBLE",
  "valCampo": "2000"
}, {
  "codCob": 1002,
  "numSecu": 3,
  "codCampo": "NUM_OD_TOWING_LIMIT",
  "nomCampo": "OWN DAMAGE TOWING LIMIT",
  "valCampo": "2000"
}, {
  "codCob": 1002,
  "numSecu": 4,
  "codCampo": "NUM_OD_REPAIR_LIMIT",
  "nomCampo": "OWN DAMAGE REPAIR LIMIT",
  "valCampo": "4000"
}, {
  "codCob": 1003,
  "numSecu": 1,
  "codCampo": "VAL_TH_SPECIAL_DEDUCTIBLE",
  "nomCampo": "THEFT SPECIAL DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1003,
  "numSecu": 2,
  "codCampo": "IMP_TH_DEDUCTIBLE",
  "nomCampo": "THEFT DEDUCTIBLE",
  "valCampo": "2000"
}, {
  "codCob": 1003,
  "numSecu": 3,
  "codCampo": "NUM_TH_TOWING_LIMIT",
  "nomCampo": "THEFT TOWING LIMIT",
  "valCampo": "2000"
}, {
  "codCob": 1003,
  "numSecu": 4,
  "codCampo": "NUM_TH_REPAIR_LIMIT",
  "nomCampo": "THEFT REPAIR LIMIT",
  "valCampo": "4000"
}, {
  "codCob": 1007,
  "numSecu": 1,
  "codCampo": "PCT_UPPA_FINAL_RATE",
  "nomCampo": "UPPA FINAL RATE",
  "valCampo": ".2"
}, {
  "codCob": 1007,
  "numSecu": 2,
  "codCampo": "TIP_UPPA_DISCOUNT",
  "nomCampo": "UPPA DISCOUNT TYPE",
  "valCampo": null
}, {
  "codCob": 1007,
  "numSecu": 3,
  "codCampo": "IMP_UPPA_DISCOUNT",
  "nomCampo": "UPPA DISCOUNT AMOUNT",
  "valCampo": "0"
}, {
  "codCob": 1007,
  "numSecu": 4,
  "codCampo": "PCT_UPPA_COMMN_ADJ",
  "nomCampo": "UPPA COMMISSION ADJUSTMENT",
  "valCampo": "20"
}, {
  "codCob": 1008,
  "numSecu": 2,
  "codCampo": "PCT_AON_FINAL_RATE",
  "nomCampo": "AON FINAL RATE",
  "valCampo": ".5"
}, {
  "codCob": 1008,
  "numSecu": 3,
  "codCampo": "VAL_AON_SPECIAL_DEDUCTIBLE",
  "nomCampo": "AON SPECIAL DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1008,
  "numSecu": 4,
  "codCampo": "IMP_AON_DEDUCTIBLE",
  "nomCampo": "AON DEDUCTIBLE",
  "valCampo": "2000"
}, {
  "codCob": 1008,
  "numSecu": 5,
  "codCampo": "NUM_AON_TOWING_LIMIT",
  "nomCampo": "AON TOWING LIMIT",
  "valCampo": "2000"
}, {
  "codCob": 1008,
  "numSecu": 6,
  "codCampo": "NUM_AON_REPAIR_LIMIT",
  "nomCampo": "AON REPAIR LIMIT",
  "valCampo": "4000"
}, {
  "codCob": 1008,
  "numSecu": 7,
  "codCampo": "PCT_AON_COMMN_ADJ",
  "nomCampo": "AON COMMISSION ADJUSTMENT",
  "valCampo": "20"
}, {
  "codCob": 1020,
  "numSecu": 2,
  "codCampo": "PCT_SRCC_FINAL_RATE",
  "nomCampo": "SRCC FINAL RATE",
  "valCampo": null
}, {
  "codCob": 1020,
  "numSecu": 3,
  "codCampo": "VAL_SRCC_SPECIAL_DEDUCTIBLE",
  "nomCampo": "SRCC SPECIAL DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1020,
  "numSecu": 4,
  "codCampo": "IMP_SRCC_DEDUCTIBLE",
  "nomCampo": "SRCC DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1020,
  "numSecu": 5,
  "codCampo": "NUM_SRCC_TOWING_LIMIT",
  "nomCampo": "SRCC TOWING LIMIT",
  "valCampo": null
}, {
  "codCob": 1020,
  "numSecu": 6,
  "codCampo": "NUM_SRCC_REPAIR_LIMIT",
  "nomCampo": "SRCC REPAIR LIMIT",
  "valCampo": null
}, {
  "codCob": 1020,
  "numSecu": 7,
  "codCampo": "PCT_SRCC_COMMN_ADJ",
  "nomCampo": "SRCC COMMISSION ADJUSTMENT",
  "valCampo": null
}, {
  "codCob": 1029,
  "numSecu": 1,
  "codCampo": "VAL_RA100_DISC",
  "nomCampo": "RA100  DISCOUNT",
  "valCampo": null
}, {
  "codCob": 1038,
  "numSecu": 1,
  "codCampo": "VAL_PREM_PER_PAX_AL",
  "nomCampo": "AMOUNT PER PASSENGER (AL)",
  "valCampo": null
}, {
  "codCob": 1040,
  "numSecu": 1,
  "codCampo": "VAL_RA_DISC",
  "nomCampo": "ROAD ASSIST DISCOUNT",
  "valCampo": null
}, {
  "codCob": 1100,
  "numSecu": 1,
  "codCampo": "TIP_LOSS_DAMAGE",
  "nomCampo": "LOSS AND DAMAGE TYPE",
  "valCampo": "1"
}, {
  "codCob": 1100,
  "numSecu": 3,
  "codCampo": "PCT_FINAL_RATE",
  "nomCampo": "FINAL RATE",
  "valCampo": "1.95"
}, {
  "codCob": 1100,
  "numSecu": 6,
  "codCampo": "PCT_ADJ_COMM_RATE",
  "nomCampo": "ADJUSTED COMMISSION RATE",
  "valCampo": "20"
}, {
  "codCob": 1100,
  "numSecu": 7,
  "codCampo": "PCT_NO_CLAIM_BONUS",
  "nomCampo": "NO CLAIM BONUS RATE",
  "valCampo": null
}, {
  "codCob": 1100,
  "numSecu": 8,
  "codCampo": "PCT_LOSS_RATIO",
  "nomCampo": "LOSS RATIO RATE",
  "valCampo": null
}, {
  "codCob": 1102,
  "numSecu": 1,
  "codCampo": "COD_LIMIT_AUTO_LIABILITY",
  "nomCampo": "AUTO LIABILITY LIMIT CODE",
  "valCampo": null
}, {
  "codCob": 1201,
  "numSecu": 2,
  "codCampo": "PCT_OD_SA_FINAL_RATE",
  "nomCampo": "OD FINAL RATE",
  "valCampo": null
}, {
  "codCob": 1201,
  "numSecu": 3,
  "codCampo": "VAL_OD_SA_SPECIAL_DEDUCTIBLE",
  "nomCampo": "OD SPECIAL DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1201,
  "numSecu": 4,
  "codCampo": "IMP_OD_SA_DEDUCTIBLE",
  "nomCampo": "OD DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1201,
  "numSecu": 5,
  "codCampo": "NUM_OD_SA_TOWING_LIMIT",
  "nomCampo": "OD TOWING LIMIT",
  "valCampo": null
}, {
  "codCob": 1201,
  "numSecu": 6,
  "codCampo": "NUM_OD_SA_REPAIR_LIMIT",
  "nomCampo": "OD REPAIR LIMIT",
  "valCampo": null
}, {
  "codCob": 1201,
  "numSecu": 7,
  "codCampo": "PCT_OD_SA_COMMN_ADJ",
  "nomCampo": "OD COMMISSION ADJUSTMENT",
  "valCampo": null
}, {
  "codCob": 1202,
  "numSecu": 2,
  "codCampo": "PCT_TH_SA_FINAL_RATE",
  "nomCampo": "TH FINAL RATE",
  "valCampo": null
}, {
  "codCob": 1202,
  "numSecu": 3,
  "codCampo": "VAL_TH_SA_SPECIAL_DEDUCTIBLE",
  "nomCampo": "TH SPECIAL DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1202,
  "numSecu": 4,
  "codCampo": "IMP_TH_SA_DEDUCTIBLE",
  "nomCampo": "TH DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1202,
  "numSecu": 5,
  "codCampo": "NUM_TH_SA_TOWING_LIMIT",
  "nomCampo": "TH TOWING LIMIT",
  "valCampo": null
}, {
  "codCob": 1202,
  "numSecu": 6,
  "codCampo": "NUM_TH_SA_REPAIR_LIMIT",
  "nomCampo": "TH REPAIR LIMIT",
  "valCampo": null
}, {
  "codCob": 1202,
  "numSecu": 7,
  "codCampo": "PCT_TH_SA_COMMN_ADJ",
  "nomCampo": "TH COMMISSION ADJUSTMENT",
  "valCampo": null
}, {
  "codCob": 1203,
  "numSecu": 2,
  "codCampo": "PCT_FIRE_SA_FINAL_RATE",
  "nomCampo": "FIRE FINAL RATE",
  "valCampo": null
}, {
  "codCob": 1203,
  "numSecu": 3,
  "codCampo": "VAL_FIRE_SA_SPECIAL_DEDUCTIBLE",
  "nomCampo": "FIRE SPECIAL DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1203,
  "numSecu": 4,
  "codCampo": "IMP_FIRE_SA_DEDUCTIBLE",
  "nomCampo": "FIRE DEDUCTIBLE",
  "valCampo": null
}, {
  "codCob": 1203,
  "numSecu": 5,
  "codCampo": "NUM_FIRE_SA_TOWING_LIMIT",
  "nomCampo": "FIRE TOWING LIMIT",
  "valCampo": null
}, {
  "codCob": 1203,
  "numSecu": 6,
  "codCampo": "NUM_FIRE_SA_REPAIR_LIMIT",
  "nomCampo": "FIRE REPAIR LIMIT",
  "valCampo": null
}, {
  "codCob": 1203,
  "numSecu": 7,
  "codCampo": "PCT_FIRE_SA_COMMN_ADJ",
  "nomCampo": "FIRE COMMISSION ADJUSTMENT",
  "valCampo": null
}];