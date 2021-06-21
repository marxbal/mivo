import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPolicyExpiringListComponent } from './client-policy-expiring-list.component';

describe('ClientPolicyExpiringListComponent', () => {
  let component: ClientPolicyExpiringListComponent;
  let fixture: ComponentFixture<ClientPolicyExpiringListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPolicyExpiringListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPolicyExpiringListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
