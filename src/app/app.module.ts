import {
  BrowserModule
} from "@angular/platform-browser";
import {
  NgModule
} from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";
import {
  HTTP_INTERCEPTORS
} from "@angular/common/http";

// import {
//   NgxFileDropModule
// } from 'ngx-file-drop';
// import {
//   NgxFileUploadCoreModule
// } from "@ngx-file-upload/core";
// import {
//   NgxDropzoneModule
// } from "ngx-dropzone";
import {
  HttpClientModule
} from "@angular/common/http";
import {
  AppRoutingModule
} from "./app-routing.module";
import {
  AppComponent
} from "./app.component";
import {
  BrowserAnimationsModule
} from "@angular/platform-browser/animations";
import {
  BsDatepickerModule
} from "ngx-bootstrap/datepicker";
import {
  ModalModule
} from "ngx-bootstrap/modal";
import {
  NgMultiSelectDropDownModule
} from "ng-multiselect-dropdown";
import {
  NgSelectModule
} from "@ng-select/ng-select";
import {
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatTooltipModule,
  MatDialogModule,
} from "@angular/material";

import {
  RouterModule,
  Routes
} from "@angular/router";
import {
  TranslateModule
} from "@ngx-translate/core";
import {
  NgHttpLoaderModule
} from "ng-http-loader";
import {
  ServiceModule
} from "./services/service.module";

//login component
import {
  LoginComponent
} from "./components/login/login.component";

//page component
import {
  DashboardComponent
} from "./components/dashboard/dashboard.component";
import {
  FooterComponent
} from "./components/footer/footer.component";
import {
  HeaderComponent
} from "./components/header/header.component";
import {
  SidenavComponent
} from "./components/sidenav/sidenav.component";
import {
  TemplateComponent
} from "./components/template/template.component";

//other feature components
import {
  MissingPageComponent
} from "./components/missing-page/missing-page.component";
import {
  ProfileComponent
} from "./components/profile/profile.component";
import {
  QueryComponent
} from "./components/query/query.component";
import {
  FaqComponent
} from "./components/faq/faq.component";

//table list components
import {
  OutstandingBillsComponent
} from "./components/outstanding-bills/outstanding-bills.component";

// quotation components
import {
  QuotationCarComponent
} from "./components/quotation-car/quotation-car.component";
import {
  QuotationHomeComponent
} from "./components/quotation-home/quotation-home.component";
import {
  QuotationTravelComponent
} from "./components/quotation-travel/quotation-travel.component";
import {
  QuotationAccidentComponent
} from "./components/quotation-accident/quotation-accident.component";

// quick quotation components
import {
  QuickQuotationCarComponent
} from "./components/quick-quotation-car/quick-quotation-car.component";
import {
  QuickQuotationHomeComponent
} from "./components/quick-quotation-home/quick-quotation-home.component";
import {
  QuickQuotationTravelComponent
} from "./components/quick-quotation-travel/quick-quotation-travel.component";
import {
  QuickQuotationAccidentComponent
} from "./components/quick-quotation-accident/quick-quotation-accident.component";

import {
  ModalComponent
} from "./components/modal/modal.component";
import {
  GroupPolicyComponent
} from "./components/group-policy/group-policy.component";

import {
  AuthGuard
} from "./helpers/auth.guard";
import {
  JwtInterceptor
} from "./helpers/jwt.interceptor";
import {
  ErrorInterceptor
} from "./helpers/error.interceptor";
import {
  fakeBackendProvider
} from "./helpers/fake-backend";
import {
  IndividualPolicyComponent
} from "./components/individual-policy/individual-policy.component";
import {
  ChooseAgentComponent
} from "./components/choose-agent/choose-agent.component";
import {
  DocumentPrintingComponent
} from "./components/document-printing/document-printing.component";
import {
  PolicyHolderComponent
} from "./components/policy-holder/policy-holder.component";
import {
  PaymentBreakdownComponent
} from "./components/payment-breakdown/payment-breakdown.component";
import {
  CoveragesComponent
} from "./components/coverages/coverages.component";
import {
  PaymentBreakdownModalComponent
} from "./components/payment-breakdown-modal/payment-breakdown-modal.component";
import {
  ReloadComponent
} from "./components/reload/reload.component";
import {
  CoverageVariableDataComponent
} from "./components/coverage-variable-data/coverage-variable-data.component";
import {
  CreateThirdPartyComponent
} from "./components/create-third-party/create-third-party.component";
import {
  FixedCoveragesComponent
} from './components/fixed-coverages/fixed-coverages.component';
import {
  RequestCreateComponent
} from './components/request-create/request-create.component';
import {
  RequestListComponent
} from './components/request-list/request-list.component';

const routes: Routes = [{
    path: "login",
    component: LoginComponent,
  },
  {
    path: "agent",
    component: ChooseAgentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "",
    component: TemplateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "reload",
    component: ReloadComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "404",
    component: MissingPageComponent,
  },
  // otherwise redirect to home
  {
    path: "**",
    redirectTo: "404",
  },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    FooterComponent,
    HeaderComponent,
    SidenavComponent,
    TemplateComponent,
    FaqComponent,
    OutstandingBillsComponent,
    QueryComponent,
    MissingPageComponent,
    ProfileComponent,
    QuotationCarComponent,
    QuotationHomeComponent,
    QuotationTravelComponent,
    QuotationAccidentComponent,
    QuickQuotationCarComponent,
    QuickQuotationHomeComponent,
    QuickQuotationTravelComponent,
    QuickQuotationAccidentComponent,
    ModalComponent,
    GroupPolicyComponent,
    IndividualPolicyComponent,
    ChooseAgentComponent,
    DocumentPrintingComponent,
    PolicyHolderComponent,
    PaymentBreakdownComponent,
    CoveragesComponent,
    PaymentBreakdownModalComponent,
    ReloadComponent,
    CoverageVariableDataComponent,
    CreateThirdPartyComponent,
    FixedCoveragesComponent,
    RequestCreateComponent,
    RequestListComponent,
  ],
  entryComponents: [ModalComponent, PaymentBreakdownModalComponent, CreateThirdPartyComponent],
  imports: [
    AppRoutingModule,
    RouterModule.forRoot(routes),
    BrowserModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ServiceModule,
    NgSelectModule,
    // NgxFileDropModule,
    // NgxDropzoneModule,
    // NgxFileUploadCoreModule,
    TranslateModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NgHttpLoaderModule.forRoot(),
  ],
  providers: [{
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    // provider used to create fake backend
    fakeBackendProvider,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}