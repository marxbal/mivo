import {
  Component,
  OnInit
} from '@angular/core';
import {
  Utility
} from 'src/app/utils/utility';
import {
  environment
} from 'src/environments/environment';

@Component({
  selector: 'app-terms-and-condition',
  templateUrl: './terms-and-condition.component.html',
  styleUrls: ['./terms-and-condition.component.css']
})
export class TermsAndConditionComponent implements OnInit {

  isStaging = !environment.production;

  constructor() {}

  ngOnInit(): void {}

  scrollTo(id: string) {
    Utility.scroll(id);
  }

  redirect() {
    window.location.href = "/";
  }

}
