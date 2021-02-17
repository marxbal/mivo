import {
  Component,
  OnInit
} from '@angular/core';
import {
  DashboardService
} from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  forex = {
    dollar: 0.0,
    euro: 0.0
  }

  constructor(private ds: DashboardService) {}

  ngOnInit() {
    const _this = this;
    this.ds.getForeignExchange().then((res) => {
      if (res.status) {
        _this.forex.dollar = res.obj["dollar"];
        _this.forex.euro = res.obj["euro"];
      }
    });

    this.ds.getDashboardInfo().then((res) => {
      if (res.status) {
        const details = res.obj;
        console.log(details["jan"]);
        console.log(details["total"]);
        console.log(details["active"]);
      }
    });

    this.loadScripts();
  }

  loadScripts() {
    const dynamicScripts = [
      './assets/js/chart.js'
    ];
    for (let i = 0; i < dynamicScripts.length; i++) {
      const node = document.createElement('script');
      node.src = dynamicScripts[i];
      node.type = 'text/javascript';
      node.async = false;
      node.charset = 'utf-8';
      document.getElementsByTagName('head')[0].appendChild(node);
    }
  }

}
