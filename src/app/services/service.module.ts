import {
  NgModule
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  BsModalRef
} from 'ngx-bootstrap/modal';
import {
  TranslateService
} from '@ngx-translate/core';

/* Services */
import {
  AppService
} from './app.service';
import {
  AuthenticationService
} from './authentication.service';
import {
  QuickQuoteService
} from './quickquote.service';
import {
  CarUtilityServices
} from './car-utility.service';
import {
  CarQuoteServices
} from './car-quote.service';
import {
  TravelUtilityServices
} from './travel-utility.service';
import {
  TravelIssueServices
} from './travel-issue.service';
import {
  AccidentIssueServices
} from './accident-issue.service';
import {
  HomeIssueServices
} from './home-issue.service';
import {
  AgentService
} from './agent.service';
import {
  DashboardService
} from './dashboard.service';
import {
  UtilityService
} from './utility.service';
import {
  PrintingService
} from './printing.service';
import {
  ThirdPartyService
} from './third-party.service';
import {
  LTOService
} from './lto.service';
import {
  RequestService
} from './request.service';
import {
  ClientService
} from './client.service';
import {
  AccountService
} from './account.service';

/* LOV Services */
import {
  LovService
} from './lov.service';
import {
  GroupPolicyLOVServices
} from './lov/group-policy.service';
import {
  CarLOVServices
} from './lov/car.service';
import {
  HomeLOVServices
} from './lov/home.service';
import {
  TravelLOVServices
} from './lov/travel.service';
import {
  AccidentLOVServices
} from './lov/accident.service';
import {
  ThirdPartyLOVServices
} from './lov/third-party-lov-service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  exports: [],
  providers: [
    BsModalRef, //bmr
    TranslateService, //ts
    AppService, //apps
    AuthenticationService, //auths
    QuickQuoteService, //qqs
    CarUtilityServices, //cus
    CarQuoteServices, //cqs
    TravelUtilityServices, //tus
    TravelIssueServices, //tis
    AccidentIssueServices, //ais
    HomeIssueServices, //his
    AgentService, //as
    DashboardService, //ds
    UtilityService, //us
    PrintingService, //ps
    ThirdPartyService, //tps
    LTOService, //ltos
    RequestService, //rs
    ClientService, //cs
    AccountService, //accs

    LovService, //ls
    GroupPolicyLOVServices, //gpls
    CarLOVServices, //cls
    HomeLOVServices, //hls
    TravelLOVServices, //tls
    AccidentLOVServices, //als
    ThirdPartyLOVServices //tpls
  ]
})
export class ServiceModule {}
