import {
  Component,
  OnInit
} from '@angular/core';
import {
  Globals
} from '../../utils/global';
import {
  Router
} from '@angular/router';
import {
  AuthenticationService
} from '../../services/authentication.service';
import {
  page
} from '../../constants/page';
import {
  User
} from 'src/app/objects/User';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  p = page; //constant pages
  canChooseAgent: boolean = false;
  currentUser = new User();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.currentUser = this.authenticationService.currentUserValue;
    this.canChooseAgent = this.currentUser.role === 2 || this.currentUser.execAgent;
  }

  setPage(val: String) {
    Globals.setPage(val);
  }

  chooseAgent() {
    this.router.navigate(['/agent']);
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }

}
