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
import {
  ActivatedRoute
} from '@angular/router';
import {
  filter
} from 'rxjs/operators';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  p = page; //constant pages
  sideNavClass = "";

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(filter(params => params.successPage))
      .subscribe(params => {
        if (params.successPage) {
          Globals.setPage(this.p.ACC.OUT);
        }
      });
  }

  get page() {
    return Globals.page;
  }
}
