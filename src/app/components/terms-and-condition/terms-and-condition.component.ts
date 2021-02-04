import {
  Component,
  OnInit
} from '@angular/core';
import {
  Utility
} from 'src/app/utils/utility';

@Component({
  selector: 'app-terms-and-condition',
  templateUrl: './terms-and-condition.component.html',
  styleUrls: ['./terms-and-condition.component.css']
})
export class TermsAndConditionComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}

  scrollTo(id: string) {
    Utility.scroll(id);
  }

  redirect() {
    window.location.href = "/";
  }

}
