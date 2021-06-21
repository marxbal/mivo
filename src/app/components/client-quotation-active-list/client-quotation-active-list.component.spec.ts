import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientQuotationActiveListComponent } from './client-quotation-active-list.component';

describe('ClientQuotationActiveListComponent', () => {
  let component: ClientQuotationActiveListComponent;
  let fixture: ComponentFixture<ClientQuotationActiveListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientQuotationActiveListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientQuotationActiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
