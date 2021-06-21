import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPolicyRenewedListComponent } from './client-policy-renewed-list.component';

describe('ClientPolicyRenewedListComponent', () => {
  let component: ClientPolicyRenewedListComponent;
  let fixture: ComponentFixture<ClientPolicyRenewedListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPolicyRenewedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPolicyRenewedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
