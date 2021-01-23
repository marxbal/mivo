import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPolicyProvisionalListComponent } from './client-policy-provisional-list.component';

describe('ClientPolicyProvisionalListComponent', () => {
  let component: ClientPolicyProvisionalListComponent;
  let fixture: ComponentFixture<ClientPolicyProvisionalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPolicyProvisionalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPolicyProvisionalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
