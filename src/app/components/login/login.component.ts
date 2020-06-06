import {
  Component,
  OnInit
} from "@angular/core";
import {
  Router,
  ActivatedRoute
} from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators
} from "@angular/forms";
import {
  Utility
} from "../../utils/utility";
import {
  BsModalService,
  BsModalRef
} from "ngx-bootstrap/modal";
import {
  first
} from "rxjs/operators";
import {
  AuthenticationService
} from "../../services/authentication.service";
import {
  MIVO_LOGIN
} from "../../constants/local.storage";
import {
  VER
} from "../../constants/app.constant";
import {
  Globals
} from "../../utils/global";
import {
  page
} from "../../constants/page";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: String;
  loading = false;
  message: any;
  alert: boolean;
  version = VER;

  //modal reference
  modalRef: BsModalRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private authenticationService: AuthenticationService
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(["/"]);
    }
    this.createForm();
  }

  ngOnInit() {
    this.modalRef = Utility.modal(
      this.modalService,
      "You are about to enter MAPFRE INSURANCE INFORMATION SYSTEM. The access and use of this system is limited to duly authorized personnel and strictly for official use only. MAPFRE INSURANCE informs all of its employees, agents, representatives, service providers, and all natural or juridical persons having official transactions with the company involving similar access to its information system that Information accessed in MAPFRE SYSTEM is considered property of MAPFRE INSURANCE and is subject to obligation of confidentiality and security in accordance with the laws on privacy and protection of personal information.",
      "MAPFRE INFORMATION USAGE SECURITY NOTICE"
    );

    var mivoLogin = localStorage.getItem(MIVO_LOGIN);
    if (mivoLogin != null) {
      var login = JSON.parse(mivoLogin);
      this.loginForm.markAsDirty();
      this.loginForm.setValue({
        username: login.username,
        password: login.password,
        rememberMe: login.rememberMe,
      });
    }

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";
  }

  createForm() {
    this.loginForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required],
      rememberMe: [],
    });
  }

  rememberMe(): void {
    if (this.loginForm.value.rememberMe) {
      localStorage.setItem(MIVO_LOGIN, JSON.stringify(this.loginForm.value));
    } else {
      localStorage.removeItem(MIVO_LOGIN);
    }
  }

  onSubmit(): void {
    this.rememberMe();
    this.loading = true;
    this.authenticationService
      .login(this.loginForm.value.username, this.loginForm.value.password)
      .pipe(first())
      .subscribe(
        (data) => {
          Globals.setPage(page.DAS.N);
          if (data.role === 1) {
            this.router.navigate([this.returnUrl]);
          } else {
            this.router.navigate(["/agent"]);
          }
        },
        (err) => {
          this.loading = false;
          this.alert = true;
          this.message = err.message;
        }
      );
  }
}
