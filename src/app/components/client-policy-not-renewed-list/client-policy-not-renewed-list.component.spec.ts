import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPolicyNotRenewedListComponent } from './client-policy-not-renewed-list.component';

describe('ClientPolicyNotRenewedListComponent', () => {
  let component: ClientPolicyNotRenewedListComponent;
  let fixture: ComponentFixture<ClientPolicyNotRenewedListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPolicyNotRenewedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPolicyNotRenewedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
