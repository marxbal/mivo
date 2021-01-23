import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientQuotationProvisionalListComponent } from './client-quotation-provisional-list.component';

describe('ClientQuotationProvisionalListComponent', () => {
  let component: ClientQuotationProvisionalListComponent;
  let fixture: ComponentFixture<ClientQuotationProvisionalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientQuotationProvisionalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientQuotationProvisionalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
