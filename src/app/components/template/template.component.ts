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
import {
  PaymentService
} from 'src/app/services/payment.service';
import {
  environment
} from 'src/environments/environment';
import {
  BsModalService
} from 'ngx-bootstrap/modal';
import {
  EXPIRY_NOTI_MINUTES,
  EXPIRY_MINUTES
} from '../../constants/app.constant';
import {
  SESSION_TIME
} from 'src/app/constants/local.storage';
import * as moment from 'moment';
import {
  Utility
} from 'src/app/utils/utility';
import {
  AuthenticationService
} from 'src/app/services/authentication.service';
import {
  Router
} from '@angular/router';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit {
  p = page; //constant pages
  isStaging = !environment.production;
  id: any;
  ctr: number = 0;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private bms: BsModalService) {}

  ngOnInit() {
    // notification for expiring session
    this.id = setInterval(() => {
      const loginTime = localStorage.getItem(SESSION_TIME);
      if (!Utility.isUndefined(loginTime)) {
        const loginDateTime = moment(new Date(loginTime));
        const now = moment(new Date());
        const duration = moment.duration(now.diff(loginDateTime));
        const minute = parseInt(duration.asMinutes().toFixed());
        if (minute >= EXPIRY_NOTI_MINUTES) {
          if (minute >= EXPIRY_MINUTES) {
            this.authenticationService.logout();
            this.router.navigate(['/login']);
          } else {
            var remainingMinutes = EXPIRY_MINUTES - minute;
            Utility.showInfo(this.bms, "Your session will expire in " + remainingMinutes + " minutes. Please relogin to continue using MIVO. Thank you!");
          }
        }
      }
    }, 60000);

    this.route.queryParams
      .subscribe(params => {
        if (params.invoiceNo && params.vpc_Message === 'Approved') {
          this.processPayment(params);
        }
      });
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

  processPayment(params: any) {
    this.paymentService.processPaymentViaGlobalPay({
      ...params,
      attempt: params.attempt === '' ? 0 : params.attempt,
    }).then(response => {
      console.log('response: ', response);
    });
  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }
}