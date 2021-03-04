import {
  Component,
  OnInit
} from '@angular/core';
import {
  LovService
} from 'src/app/services/lov.service';
import {
  environment
} from '../../../environments/environment';
import {
  VER
} from '../../constants/app.constant';

@Component({
  selector: 'app-health-check',
  templateUrl: './health-check.component.html',
  styleUrls: ['./health-check.component.css']
})
export class HealthCheckComponent implements OnInit {

  apiUrl = environment.apiUrl;
  imgUrl = environment.imgUrl;
  production = environment.production;
  version = VER;
  backendConfigList: any = {
    version: 'n/a',
    dbUrl: 'n/a',
    cocafRegisterUrl: 'n/a',
    cocafVerifyUrl: 'n/a',
    policyCentralUrl: 'n/a',
    techControlUrl: 'n/a'
  };

  constructor(private ls: LovService) {}

  ngOnInit(): void {
    this.ls.getConfigList().then(res => {
      if (res.status) {
        this.backendConfigList = res.obj;
      }
    });
  }

  redirect() {
    window.location.href = "/";
  }

}
