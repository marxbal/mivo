import {
  Component,
  OnInit
} from '@angular/core';
import {
  Globals
} from '../../utils/global';
import {
  page
} from '../../constants/page';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ViewDetailsModalComponent } from '../view-details-modal/view-details-modal.component';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  p = page; //constant pages

  constructor(private route: ActivatedRoute, private dialog: MatDialog) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(
        filter(params => params.successPage)
      )
      .subscribe(params => {
        if (params.successPage)  {
          Globals.setPage(this.p.ACC.OUT);
          this.dialog.open(ViewDetailsModalComponent, {
            width: '1000px',
            data: {
              type: this.p.ACC.SUC,
            },
          });
        }
        console.log(params);
      });
  }

  get page() {
    return Globals.page;
  }
}
