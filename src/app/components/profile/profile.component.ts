import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import {
  UtilityService
} from 'src/app/services/utility.service';
import {
  AuthenticationService
} from '../../services/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser = this.authenticationService.currentUserValue;
  changePasswordForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private us: UtilityService) {
    this.createChangePasswordForm();
  }

  createChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {

  }

  changePassword() {
    this.us.changePassword(this.changePasswordForm.get("oldPassword").value, this.changePasswordForm.get("newPassword").value).then((res) => {
      if (res.status) {
        alert("napalitan");
      } else {
        alert("hindi");
      }
    });
  }

}
