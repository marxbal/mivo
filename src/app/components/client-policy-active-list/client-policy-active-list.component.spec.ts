import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPolicyActiveListComponent } from './client-policy-active-list.component';

describe('ClientPolicyActiveListComponent', () => {
  let component: ClientPolicyActiveListComponent;
  let fixture: ComponentFixture<ClientPolicyActiveListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPolicyActiveListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPolicyActiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
