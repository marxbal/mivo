import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPolicyCancelledListComponent } from './client-policy-cancelled-list.component';

describe('ClientPolicyCancelledListComponent', () => {
  let component: ClientPolicyCancelledListComponent;
  let fixture: ComponentFixture<ClientPolicyCancelledListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPolicyCancelledListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPolicyCancelledListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
